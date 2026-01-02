import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';

const execAsync = promisify(exec);
const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);

// Helper to find executable
async function getCommand(): Promise<string> {
  // 1. Check for local Tectonic binary in project bin folder (Best for this project)
  const localTectonic = path.join(process.cwd(), 'bin', 'tectonic.exe');
  if (fs.existsSync(localTectonic)) {
    return `"${localTectonic}"`;
  }

  // 2. Check for global Tectonic
  try {
    await execAsync('tectonic --version');
    return 'tectonic';
  } catch (e) {
    // Fallback to pdflatex if Tectonic is missing (legacy support)
    try {
      await execAsync('pdflatex --version');
      return 'pdflatex';
    } catch (e2) {
      // Check common Windows path for MiKTeX
      const userProfile = process.env.USERPROFILE || '';
      const miktexPath = path.join(userProfile, 'AppData', 'Local', 'Programs', 'MiKTeX', 'miktex', 'bin', 'x64', 'pdflatex.exe');
      if (fs.existsSync(miktexPath)) {
        return `"${miktexPath}"`;
      }
      throw new Error('No LaTeX compiler found. Please install Tectonic or TeX Live.');
    }
  }
}

export async function GET() {
  try {
    const cmd = await getCommand();
    const { stdout } = await execAsync(`${cmd} --version`);
    const version = stdout.split('\n')[0];
    return NextResponse.json({ status: 'ok', version, compiler: cmd });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'LaTeX compiler not found.' 
    }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { latexCode } = await req.json();

    if (!latexCode) {
      return NextResponse.json({ error: 'No LaTeX code provided' }, { status: 400 });
    }

    // Resolve compiler command
    let compileCmd = '';
    let isTectonic = false;
    
    try {
      const cmd = await getCommand();
      compileCmd = cmd;
      isTectonic = cmd.toLowerCase().includes('tectonic');
    } catch (e) {
      return NextResponse.json({ error: 'Compiler not found on server.' }, { status: 500 });
    }

    // Create a unique temp directory
    const uniqueId = Math.random().toString(36).substring(7);
    const tempDir = path.join(os.tmpdir(), `latex-${uniqueId}`);
    
    if (!fs.existsSync(tempDir)){
        fs.mkdirSync(tempDir);
    }

    const texFilePath = path.join(tempDir, 'resume.tex');
    const pdfFilePath = path.join(tempDir, 'resume.pdf');

    // Write .tex file
    await writeFileAsync(texFilePath, latexCode);

    // Compile
    try {
      // Set a timeout of 60 seconds (Tectonic might need time to download packages on first run)
      const options = { timeout: 60000 }; 
      
      let fullCommand = '';
      if (isTectonic) {
        // Tectonic usage: tectonic -o <output_dir> <input_file>
        // It automatically handles multiple passes and package downloads
        fullCommand = `${compileCmd} -o "${tempDir}" "${texFilePath}"`;
      } else {
        // Legacy pdflatex usage
        fullCommand = `${compileCmd} -interaction=nonstopmode -halt-on-error -output-directory="${tempDir}" "${texFilePath}"`;
      }

      console.log(`Executing: ${fullCommand}`);
      const { stdout, stderr } = await execAsync(fullCommand, options);
      
      // Filter out benign warnings to reduce noise
      const cleanStderr = stderr.replace(/Fontconfig error: Cannot load default config file: No such file: \(null\)\n?/g, '');
      const logs = `STDOUT:\n${stdout}\n\nSTDERR:\n${cleanStderr}`;
      
      // Read the generated PDF
      if (fs.existsSync(pdfFilePath)) {
        const pdfBuffer = await readFileAsync(pdfFilePath);
        const pdfBase64 = pdfBuffer.toString('base64');
        
        // Clean up
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (e) { console.error('Cleanup error', e); }

        return NextResponse.json({
          success: true,
          pdf: pdfBase64,
          logs: logs
        });
      } else {
         return NextResponse.json({ error: 'PDF file was not generated', details: logs }, { status: 500 });
      }
      
    } catch (error: any) {
      console.error('Compilation error:', error);
      
      // Try to read the log file (Tectonic might not produce a .log file in the same way, but let's check)
      const logFilePath = path.join(tempDir, 'resume.log');
      let logContent = 'Compilation failed.';
      
      if (error.killed) {
        logContent = 'Compilation timed out. The compiler might be downloading packages.';
      } else if (fs.existsSync(logFilePath)) {
        logContent = await readFileAsync(logFilePath, 'utf-8');
      } else if (error.stdout || error.stderr) {
        // Tectonic prints errors to stdout/stderr
        logContent = `STDOUT:\n${error.stdout}\n\nSTDERR:\n${error.stderr}`;
      } else if (error.message) {
        logContent = error.message;
      }
      
      // Clean up
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (e) { console.error('Cleanup error', e); }

      return NextResponse.json({ 
        error: 'Compilation failed', 
        details: logContent 
      }, { status: 400 });
    }


  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

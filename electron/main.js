const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs-extra');
const os = require('os');
// === Mise à jour: activée par défaut en version packagée ===
// Pour désactiver, définir DISABLE_UPDATES=true dans l'environnement.
const updatesEnabled = app.isPackaged && process.env.DISABLE_UPDATES !== 'true';

let UpdateManager;
if (updatesEnabled) {
  // On ne charge la logique de mise à jour que si elle est activée
  UpdateManager = require('./updater');
}

let mainWindow;
let updateManager;
// Détermine si l'application tourne en mode développement
// On considère que tout lancement non packagé est du développement
const isDev = !app.isPackaged || process.env.NODE_ENV === 'development';
let pythonPath = 'python';

// Check if running in packaged mode
const isPackaged = app.isPackaged;

// Get backend path (for packaged version)
const getBackendPath = () => {
  if (isPackaged) {
    // In packaged mode, use the embedded backend.exe
    return path.join(process.resourcesPath, 'backend.exe');
  } else {
    // In development mode, use Python script
    return path.join(__dirname, '..', 'src', 'cli_generate.py');
  }
};

// Paths for resources
const getResourcePath = (relativePath) => {
  if (isPackaged) {
    return path.join(process.resourcesPath, relativePath);
  } else {
    return path.join(__dirname, '..', relativePath);
  }
};

// Create main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'json-tools-logo.ico'),
    show: false,
    titleBarStyle: 'default'
  });

  // Load the application
  if (isDev) {
    // In development mode, load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');
  } else {
    // In production mode, load from built files
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Mise à jour : activer seulement en mode packagé (sauf si désactivée via env)
    if (updatesEnabled) {
      // Initialize update manager
      updateManager = new UpdateManager(mainWindow);

      // Check for updates automatically on startup (after 3 seconds delay)
      setTimeout(async () => {
        if (updateManager) {
          try {
            await updateManager.checkForUpdatesAndNotify();
          } catch (error) {
            console.error('❌ Erreur lors de la vérification automatique des mises à jour:', error);
          }
        }
      }, 3000);
    }
    
    // Check Python and dependencies
    checkPythonAndDependencies();
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Development mode: open DevTools
  if (!isPackaged) {
    mainWindow.webContents.openDevTools();
  }
}

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Check Python installation
async function checkPythonInstallation() {
  return new Promise((resolve) => {
    const pythonCommands = ['python', 'python3', 'py'];
    
    let index = 0;
    
    function tryNextCommand() {
      if (index >= pythonCommands.length) {
        resolve(false);
        return;
      }
      
      const command = pythonCommands[index];
      const child = spawn(command, ['--version'], { shell: true });
      
      child.on('close', (code) => {
        if (code === 0) {
          pythonPath = command;
          resolve(true);
        } else {
          index++;
          tryNextCommand();
        }
      });
      
      child.on('error', () => {
        index++;
        tryNextCommand();
      });
    }
    
    tryNextCommand();
  });
}

// Install Python dependencies
async function installPythonDependencies() {
  return new Promise((resolve, reject) => {
    const requirementsPath = getResourcePath('requirements.txt');
    
    if (!fs.existsSync(requirementsPath)) {
      resolve();
      return;
    }
    
    const child = spawn(pythonPath, ['-m', 'pip', 'install', '-r', requirementsPath], { shell: true });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error('Failed to install Python dependencies'));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Check Python and dependencies
async function checkPythonAndDependencies() {
  // In packaged mode, we use backend.exe (embedded Python), so no check needed
  if (isPackaged) {
    mainWindow.webContents.send('python-ready');
    return;
  }
  try {
    const pythonInstalled = await checkPythonInstallation();
    
    if (!pythonInstalled) {
      dialog.showErrorBox(
        'Python Required',
        'Python is not installed on your system.\n\nPlease install Python 3.7+ from https://python.org\n\nDon\'t forget to check "Add Python to PATH" during installation.'
      );
      app.quit();
      return;
    }
    
    // Install Python dependencies
    await installPythonDependencies();
    
    // Notify that everything is ready
    mainWindow.webContents.send('python-ready');
    
  } catch (error) {
    dialog.showErrorBox(
      'Initialization Error',
      `Unable to initialize Python:\n${error.message}`
    );
  }
}

// File dialog handler
ipcMain.handle('open-file-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: options.filters || [
      { name: 'All Files', extensions: ['*'] }
    ],
    title: options.title || 'Select a file'
  });
  
  if (result.canceled) {
    return null;
  }
  
  return result.filePaths[0];
});

// Save file dialog handler
ipcMain.handle('save-file-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: options.filters || [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    defaultPath: options.defaultPath || 'generated_data.json',
    title: options.title || 'Save file'
  });
  
  if (result.canceled) {
    return null;
  }
  
  return result.filePath;
});

// Read file handler
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Compatibility alias used by preload
ipcMain.handle('read-json-file', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Write file handler
ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    await fs.writeFile(filePath, content, 'utf8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Compatibility alias used by preload (object payload)
ipcMain.handle('save-file', async (event, payload) => {
  try {
    const { filePath, data } = payload || {};
    if (!filePath) return { success: false, error: 'No filePath provided' };
    await fs.writeFile(filePath, data ?? '', 'utf8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Generate JSON data from file via Python script
ipcMain.handle('generate-json', async (event, { skeletonPath, swaggerPath }) => {
  return new Promise((resolve, reject) => {
    let command;
    let args = [];

    if (isPackaged) {
      // Use embedded standalone executable
      command = getBackendPath();
      args = ['--skeleton', skeletonPath, '--pretty'];
      if (swaggerPath) {
        args.push('--swagger', swaggerPath);
      }
    } else {
      // In development: call Python interpreter with CLI script
      const pythonScriptPath = getResourcePath('src/cli_generate.py');
      if (!fs.existsSync(pythonScriptPath)) {
        reject(new Error('Python script not found'));
        return;
      }
      command = pythonPath;
      args = [pythonScriptPath, '--skeleton', skeletonPath, '--pretty'];
      if (swaggerPath) {
        args.push('--swagger', swaggerPath);
      }
    }

    const child = spawn(command, args, { shell: true });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          resolve({ success: true, data: result });
        } catch (parseError) {
          reject(new Error(`Invalid JSON output: ${parseError.message}`));
        }
      } else {
        reject(new Error(`Process exited with code ${code}: ${errorOutput}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
});

// Generate JSON data from content via Python script
ipcMain.handle('generate-json-from-content', async (event, { skeletonContent, swaggerPath }) => {
  return new Promise(async (resolve, reject) => {
    let tempFile = null;
    
    try {
      // Create temporary file with the JSON content
      const tempDir = os.tmpdir();
      tempFile = path.join(tempDir, `skeleton_${Date.now()}.json`);
      
      // Validate JSON content
      JSON.parse(skeletonContent);
      
      // Write content to temporary file
      await fs.writeFile(tempFile, skeletonContent, 'utf8');
      
      let command;
      let args = [];

      if (isPackaged) {
        // Use embedded standalone executable
        command = getBackendPath();
        args = ['--skeleton', tempFile, '--pretty'];
        if (swaggerPath) {
          args.push('--swagger', swaggerPath);
        }
      } else {
        // In development: call Python interpreter with CLI script
        const pythonScriptPath = getResourcePath('src/cli_generate.py');
        if (!fs.existsSync(pythonScriptPath)) {
          reject(new Error('Python script not found'));
          return;
        }
        command = pythonPath;
        args = [pythonScriptPath, '--skeleton', tempFile, '--pretty'];
        if (swaggerPath) {
          args.push('--swagger', swaggerPath);
        }
      }

      const child = spawn(command, args, { shell: true });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve({ success: true, data: result });
          } catch (parseError) {
            reject(new Error(`Invalid JSON output: ${parseError.message}`));
          }
        } else {
          reject(new Error(`Process exited with code ${code}: ${errorOutput}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
      
    } catch (error) {
      reject(error);
    } finally {
      // Clean up temporary file
      if (tempFile && fs.existsSync(tempFile)) {
        try {
          await fs.unlink(tempFile);
        } catch (cleanupError) {
          console.error('Failed to clean up temporary file:', cleanupError);
        }
      }
    }
  });
});

// Get example files
ipcMain.handle('get-examples', async () => {
  try {
    const examplesPath = getResourcePath('examples');
    
    if (!fs.existsSync(examplesPath)) {
      return { success: false, error: 'Examples folder not found' };
    }
    
    const files = await fs.readdir(examplesPath);
    const examples = files
      .filter(file => file.endsWith('.json') || file.endsWith('.yaml') || file.endsWith('.yml'))
      .map(file => ({
        name: file,
        path: path.join(examplesPath, file)
      }));
    
    return { success: true, examples };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Load example file
ipcMain.handle('load-example', async (event, examplePath) => {
  try {
    const content = await fs.readFile(examplePath, 'utf8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Copy to clipboard
ipcMain.handle('copy-to-clipboard', async (event, text) => {
  try {
    const { clipboard } = require('electron');
    clipboard.writeText(text);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Show item in folder
ipcMain.handle('show-item-in-folder', async (event, filePath) => {
  try {
    shell.showItemInFolder(filePath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Open external link
ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Check if file exists
ipcMain.handle('file-exists', async (event, filePath) => {
  try {
    const exists = await fs.pathExists(filePath);
    return { success: true, exists };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get file stats
ipcMain.handle('get-file-stats', async (event, filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return { 
      success: true, 
      stats: {
        size: stats.size,
        mtime: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory()
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Create directory
ipcMain.handle('create-directory', async (event, dirPath) => {
  try {
    await fs.ensureDir(dirPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Delete file or directory
ipcMain.handle('delete-path', async (event, targetPath) => {
  try {
    await fs.remove(targetPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get app version (moved to update handlers section)

// Get system info
ipcMain.handle('get-system-info', async () => {
  return {
    success: true,
    info: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome
    }
  };
});

// Quit application
ipcMain.handle('quit-app', async () => {
  app.quit();
});

// Restart application
ipcMain.handle('restart-app', async () => {
  app.relaunch();
  app.quit();
});

// Show message box
ipcMain.handle('show-message-box', async (event, options) => {
  try {
    const result = await dialog.showMessageBox(mainWindow, options);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Show error box
ipcMain.handle('show-error-box', async (event, title, content) => {
  try {
    dialog.showErrorBox(title, content);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Convenience wrappers used by preload
ipcMain.handle('show-error', async (_event, { title, message }) => {
  try {
    dialog.showErrorBox(title || 'Error', message || '');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('show-info', async (_event, { title, message }) => {
  try {
    await dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: title || 'Info',
      message: message || ''
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Minimize window
ipcMain.handle('minimize-window', async () => {
  try {
    if (mainWindow) {
      mainWindow.minimize();
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Maximize window
ipcMain.handle('maximize-window', async () => {
  try {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Close window
ipcMain.handle('close-window', async () => {
  try {
    if (mainWindow) {
      mainWindow.close();
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get window state
ipcMain.handle('get-window-state', async () => {
  try {
    if (mainWindow) {
      return {
        success: true,
        state: {
          isMaximized: mainWindow.isMaximized(),
          isMinimized: mainWindow.isMinimized(),
          isFullScreen: mainWindow.isFullScreen(),
          bounds: mainWindow.getBounds()
        }
      };
    }
    return { success: false, error: 'Window not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Set window bounds
ipcMain.handle('set-window-bounds', async (event, bounds) => {
  try {
    if (mainWindow) {
      mainWindow.setBounds(bounds);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Update handlers
ipcMain.handle('check-for-updates', async () => {
  if (updateManager) {
    await updateManager.checkForUpdates();
  } else if (!isPackaged) {
    // Envoyer un statut non bloquant en dev
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('update-status', {
        status: 'not-available',
        message: 'Updates are only available in packaged builds.'
      });
    }
  } else {
    if (mainWindow && mainWindow.webContents) {
      const disabled = process.env.DISABLE_UPDATES === 'true';
      mainWindow.webContents.send('update-status', {
        status: 'error',
        message: disabled ? 'Updates are disabled by configuration.' : 'Update service not initialized.'
      });
    }
  }
});

ipcMain.handle('check-for-updates-and-notify', async () => {
  if (updateManager) {
    await updateManager.checkForUpdatesAndNotify(); // Silencieux
  }
});

ipcMain.handle('quit-and-install', async () => {
  if (updateManager) {
    updateManager.quitAndInstall();
  }
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// New unified handlers for the updated interface
ipcMain.handle('generate-data', async (event, requestData) => {
  const { skeleton_path, skeleton_content, swagger_path, seed, count } = requestData;
  
  let result;
  
  if (skeleton_path) {
    // Use file-based generation
    result = await new Promise((resolve, reject) => {
      let command;
      let args = [];

      if (isPackaged) {
        command = getBackendPath();
        args = ['--skeleton', skeleton_path, '--pretty'];
        if (swagger_path) {
          args.push('--swagger', swagger_path);
        }
        if (seed) args.push('--seed', String(seed));
        if (count) args.push('--count', String(count));
      } else {
        const pythonScriptPath = getResourcePath('src/cli_generate.py');
        if (!fs.existsSync(pythonScriptPath)) {
          reject(new Error('Python script not found'));
          return;
        }
        command = pythonPath;
        args = [pythonScriptPath, '--skeleton', skeleton_path, '--pretty'];
        if (swagger_path) {
          args.push('--swagger', swagger_path);
        }
        if (seed) args.push('--seed', String(seed));
        if (count) args.push('--count', String(count));
      }

      const child = spawn(command, args, { shell: true });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve({ success: true, data: result });
          } catch (parseError) {
            reject(new Error(`Invalid JSON output: ${parseError.message}`));
          }
        } else {
          reject(new Error(`Process exited with code ${code}: ${errorOutput}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  } else if (skeleton_content) {
    // Use content-based generation
    result = await new Promise(async (resolve, reject) => {
      let tempFile = null;
      
      try {
        const tempDir = os.tmpdir();
        tempFile = path.join(tempDir, `skeleton_${Date.now()}.json`);
        
        JSON.parse(skeleton_content);
        await fs.writeFile(tempFile, skeleton_content, 'utf8');
        
        let command;
        let args = [];

        if (isPackaged) {
          command = getBackendPath();
          args = ['--skeleton', tempFile, '--pretty'];
          if (swagger_path) {
            args.push('--swagger', swagger_path);
          }
          if (seed) args.push('--seed', String(seed));
          if (count) args.push('--count', String(count));
        } else {
          const pythonScriptPath = getResourcePath('src/cli_generate.py');
          if (!fs.existsSync(pythonScriptPath)) {
            reject(new Error('Python script not found'));
            return;
          }
          command = pythonPath;
          args = [pythonScriptPath, '--skeleton', tempFile, '--pretty'];
          if (swagger_path) {
            args.push('--swagger', swagger_path);
          }
          if (seed) args.push('--seed', String(seed));
          if (count) args.push('--count', String(count));
        }

        const child = spawn(command, args, { shell: true });

        let output = '';
        let errorOutput = '';

        child.stdout.on('data', (data) => {
          output += data.toString();
        });

        child.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });

        child.on('close', async (code) => {
          // Clean up temp file after process completion
          if (tempFile && fs.existsSync(tempFile)) {
            try {
              await fs.unlink(tempFile);
            } catch (cleanupError) {
              console.error('Failed to clean up temporary file:', cleanupError);
            }
          }
          
          if (code === 0) {
            try {
              const result = JSON.parse(output);
              resolve({ success: true, data: result });
            } catch (parseError) {
              reject(new Error(`Invalid JSON output: ${parseError.message}`));
            }
          } else {
            reject(new Error(`Process exited with code ${code}: ${errorOutput}`));
          }
        });

        child.on('error', async (error) => {
          // Clean up temp file on error
          if (tempFile && fs.existsSync(tempFile)) {
            try {
              await fs.unlink(tempFile);
            } catch (cleanupError) {
              console.error('Failed to clean up temporary file:', cleanupError);
            }
          }
          reject(error);
        });
        
      } catch (error) {
        reject(error);
      }
    });
  } else {
    result = { success: false, error: 'No skeleton data provided' };
  }
  
  return result;
});

// Analyze data for sensitive fields
ipcMain.handle('analyze-data', async (event, requestData) => {
  const { data_path, data_content } = requestData;
  
  let result;
  
  if (data_path) {
    // Use file-based analysis
    result = await new Promise((resolve, reject) => {
      let command;
      let args = [];

      if (isPackaged) {
        command = getBackendPath();
        args = ['--analyze', data_path, '--pretty'];
      } else {
        const pythonScriptPath = getResourcePath('src/cli_generate.py');
        if (!fs.existsSync(pythonScriptPath)) {
          reject(new Error('Python script not found'));
          return;
        }
        command = pythonPath;
        args = [pythonScriptPath, '--analyze', data_path, '--pretty'];
      }

      const child = spawn(command, args, { shell: true });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve({ success: true, analysis: result });
          } catch (parseError) {
            reject(new Error(`Invalid JSON output: ${parseError.message}`));
          }
        } else {
          reject(new Error(`Process exited with code ${code}: ${errorOutput}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  } else if (data_content) {
    // Use content-based analysis
    result = await new Promise(async (resolve, reject) => {
      let tempFile = null;
      
      try {
        const tempDir = os.tmpdir();
        tempFile = path.join(tempDir, `data_${Date.now()}.json`);
        
        JSON.parse(data_content);
        await fs.writeFile(tempFile, data_content, 'utf8');
        
        let command;
        let args = [];

        if (isPackaged) {
          command = getBackendPath();
          args = ['--analyze', tempFile, '--pretty'];
        } else {
          const pythonScriptPath = getResourcePath('src/cli_generate.py');
          if (!fs.existsSync(pythonScriptPath)) {
            reject(new Error('Python script not found'));
            return;
          }
          command = pythonPath;
          args = [pythonScriptPath, '--analyze', tempFile, '--pretty'];
        }

        const child = spawn(command, args, { shell: true });

        let output = '';
        let errorOutput = '';

        child.stdout.on('data', (data) => {
          output += data.toString();
        });

        child.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });

        child.on('close', async (code) => {
          // Clean up temp file after process completion
          if (tempFile && fs.existsSync(tempFile)) {
            try {
              await fs.unlink(tempFile);
            } catch (cleanupError) {
              console.error('Failed to clean up temporary file:', cleanupError);
            }
          }
          
          if (code === 0) {
            try {
              const result = JSON.parse(output);
              resolve({ success: true, analysis: result });
            } catch (parseError) {
              reject(new Error(`Invalid JSON output: ${parseError.message}`));
            }
          } else {
            reject(new Error(`Process exited with code ${code}: ${errorOutput}`));
          }
        });

        child.on('error', async (error) => {
          // Clean up temp file on error
          if (tempFile && fs.existsSync(tempFile)) {
            try {
              await fs.unlink(tempFile);
            } catch (cleanupError) {
              console.error('Failed to clean up temporary file:', cleanupError);
            }
          }
          reject(error);
        });
        
      } catch (error) {
        reject(error);
      }
    });
  } else {
    result = { success: false, error: 'No data provided for analysis' };
  }
  
  return result;
});

// Anonymize data
ipcMain.handle('anonymize-data', async (event, requestData) => {
  const { data_path, data_content, analyze_first } = requestData;
  
  let result;
  
  if (data_path) {
    // Use file-based anonymization
    result = await new Promise((resolve, reject) => {
      let command;
      let args = [];

      if (isPackaged) {
        command = getBackendPath();
        args = ['--anonymize', data_path, '--pretty'];
      } else {
        const pythonScriptPath = getResourcePath('src/cli_generate.py');
        if (!fs.existsSync(pythonScriptPath)) {
          reject(new Error('Python script not found'));
          return;
        }
        command = pythonPath;
        args = [pythonScriptPath, '--anonymize', data_path, '--pretty'];
      }

      const child = spawn(command, args, { shell: true });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve({ success: true, data: result });
          } catch (parseError) {
            reject(new Error(`Invalid JSON output: ${parseError.message}`));
          }
        } else {
          reject(new Error(`Process exited with code ${code}: ${errorOutput}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  } else if (data_content) {
    // Use content-based anonymization
    result = await new Promise(async (resolve, reject) => {
      let tempFile = null;
      
      try {
        const tempDir = os.tmpdir();
        tempFile = path.join(tempDir, `data_${Date.now()}.json`);
        
        JSON.parse(data_content);
        await fs.writeFile(tempFile, data_content, 'utf8');
        
        let command;
        let args = [];

        if (isPackaged) {
          command = getBackendPath();
          args = ['--anonymize', tempFile, '--pretty'];
        } else {
          const pythonScriptPath = getResourcePath('src/cli_generate.py');
          if (!fs.existsSync(pythonScriptPath)) {
            reject(new Error('Python script not found'));
            return;
          }
          command = pythonPath;
          args = [pythonScriptPath, '--anonymize', tempFile, '--pretty'];
        }

        const child = spawn(command, args, { shell: true });

        let output = '';
        let errorOutput = '';

        child.stdout.on('data', (data) => {
          output += data.toString();
        });

        child.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });

        child.on('close', async (code) => {
          // Clean up temp file after process completion
          if (tempFile && fs.existsSync(tempFile)) {
            try {
              await fs.unlink(tempFile);
            } catch (cleanupError) {
              console.error('Failed to clean up temporary file:', cleanupError);
            }
          }
          
          if (code === 0) {
            try {
              const result = JSON.parse(output);
              resolve({ success: true, data: result });
            } catch (parseError) {
              reject(new Error(`Invalid JSON output: ${parseError.message}`));
            }
          } else {
            reject(new Error(`Process exited with code ${code}: ${errorOutput}`));
          }
        });

        child.on('error', async (error) => {
          // Clean up temp file on error
          if (tempFile && fs.existsSync(tempFile)) {
            try {
              await fs.unlink(tempFile);
            } catch (cleanupError) {
              console.error('Failed to clean up temporary file:', cleanupError);
            }
          }
          reject(error);
        });
        
      } catch (error) {
        reject(error);
      }
    });
  } else {
    result = { success: false, error: 'No data provided for anonymization' };
  }
  
  return result;
});
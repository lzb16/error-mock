import { getUser, login, updateProfile } from './api/user';
import { uploadFile, listFiles, deleteFile } from './api/storage';

function showResult(data: any, isError = false) {
  const resultDiv = document.getElementById('result')!;
  resultDiv.className = isError ? 'error' : 'success';
  resultDiv.textContent = JSON.stringify(data, null, 2);
}

function showError(error: any) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  showResult({ error: errorMessage }, true);
}

// User API button handlers
document.getElementById('fetch-user')?.addEventListener('click', async () => {
  try {
    showResult({ status: 'Loading user...' });
    const result = await getUser({ id: 1 });
    showResult(result);
  } catch (error) {
    showError(error);
  }
});

document.getElementById('login')?.addEventListener('click', async () => {
  try {
    showResult({ status: 'Logging in...' });
    const result = await login({
      email: 'user@example.com',
      password: 'password123',
    });
    showResult(result);
  } catch (error) {
    showError(error);
  }
});

document.getElementById('update-profile')?.addEventListener('click', async () => {
  try {
    showResult({ status: 'Updating profile...' });
    const result = await updateProfile({
      name: 'John Doe',
      avatar: 'https://example.com/avatar.jpg',
    });
    showResult(result);
  } catch (error) {
    showError(error);
  }
});

// Storage API button handlers
document.getElementById('upload-file')?.addEventListener('click', async () => {
  try {
    showResult({ status: 'Uploading file...' });
    const mockFile = new File(['Hello World'], 'test.txt', { type: 'text/plain' });
    const result = await uploadFile({
      file: mockFile,
      folder: 'documents',
    });
    showResult(result);
  } catch (error) {
    showError(error);
  }
});

document.getElementById('list-files')?.addEventListener('click', async () => {
  try {
    showResult({ status: 'Fetching files...' });
    const result = await listFiles({
      folder: 'documents',
      page: 1,
      pageSize: 10,
    });
    showResult(result);
  } catch (error) {
    showError(error);
  }
});

document.getElementById('delete-file')?.addEventListener('click', async () => {
  try {
    showResult({ status: 'Deleting file...' });
    const result = await deleteFile({ id: 'file-123' });
    showResult(result);
  } catch (error) {
    showError(error);
  }
});

console.log('Error Mock Vite Example initialized');
console.log('Open the Error Mock UI panel in the browser to configure mock responses');

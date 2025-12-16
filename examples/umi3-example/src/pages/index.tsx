import React, { useCallback, useState } from 'react';
import { getUser, login, updateProfile } from '../api/user';
import { uploadFile, listFiles, deleteFile } from '../api/storage';
import './index.css';

export default function IndexPage() {
  const [result, setResult] = useState<{ text: string; kind: 'idle' | 'success' | 'error' }>({
    text: 'Click a button to make an API request...',
    kind: 'idle',
  });

  const showResult = useCallback((data: unknown, isError = false) => {
    setResult({
      text: JSON.stringify(data, null, 2),
      kind: isError ? 'error' : 'success',
    });
  }, []);

  const showError = useCallback(
    (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      showResult({ error: errorMessage }, true);
    },
    [showResult]
  );

  const handleGetUser = useCallback(async () => {
    try {
      showResult({ status: 'Loading user...' });
      const data = await getUser({ id: 1 });
      showResult(data);
    } catch (error) {
      showError(error);
    }
  }, [showError, showResult]);

  const handleLogin = useCallback(async () => {
    try {
      showResult({ status: 'Logging in...' });
      const data = await login({
        email: 'user@example.com',
        password: 'password123',
      });
      showResult(data);
    } catch (error) {
      showError(error);
    }
  }, [showError, showResult]);

  const handleUpdateProfile = useCallback(async () => {
    try {
      showResult({ status: 'Updating profile...' });
      const data = await updateProfile({
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
      });
      showResult(data);
    } catch (error) {
      showError(error);
    }
  }, [showError, showResult]);

  const handleUploadFile = useCallback(async () => {
    try {
      showResult({ status: 'Uploading file...' });
      const mockFile = new File(['Hello World'], 'test.txt', { type: 'text/plain' });
      const data = await uploadFile({
        file: mockFile,
        folder: 'documents',
      });
      showResult(data);
    } catch (error) {
      showError(error);
    }
  }, [showError, showResult]);

  const handleListFiles = useCallback(async () => {
    try {
      showResult({ status: 'Fetching files...' });
      const data = await listFiles({
        folder: 'documents',
        page: 1,
        pageSize: 10,
      });
      showResult(data);
    } catch (error) {
      showError(error);
    }
  }, [showError, showResult]);

  const handleDeleteFile = useCallback(async () => {
    try {
      showResult({ status: 'Deleting file...' });
      const data = await deleteFile({ id: 'file-123' });
      showResult(data);
    } catch (error) {
      showError(error);
    }
  }, [showError, showResult]);

  return (
    <div>
      <h1>Error Mock Plugin Example (Umi3)</h1>

      <div className="card">
        <h2>User API</h2>
        <div className="button-group">
          <button type="button" onClick={handleGetUser}>
            Get User
          </button>
          <button type="button" onClick={handleLogin}>
            Login
          </button>
          <button type="button" onClick={handleUpdateProfile}>
            Update Profile
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Storage API</h2>
        <div className="button-group">
          <button type="button" onClick={handleUploadFile}>
            Upload File
          </button>
          <button type="button" onClick={handleListFiles}>
            List Files
          </button>
          <button type="button" onClick={handleDeleteFile}>
            Delete File
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Result</h2>
        <div id="result" className={result.kind === 'idle' ? '' : result.kind}>
          {result.text}
        </div>
      </div>

      <div className="card">
        <h2>Tips</h2>
        <p>Look for the blue wand button in the bottom-right corner to open the Error Mock UI.</p>
        <p>Without mocking enabled, these requests will usually 404; enable rules to see mocked results.</p>
      </div>
    </div>
  );
}

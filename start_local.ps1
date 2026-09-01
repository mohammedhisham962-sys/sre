Write-Host "Installing backend dependencies..."
cd backend
pip install -r requirements.txt
Write-Host "Starting backend..."
Start-Process -NoNewWindow -FilePath "python" -ArgumentList "-m uvicorn app.main:app --reload --port 8000"
cd ../frontend
Write-Host "Installing frontend dependencies..."
cmd.exe /c "npm install"
Write-Host "Starting frontend..."
Start-Process -NoNewWindow -FilePath "cmd.exe" -ArgumentList "/c npm run dev"
Write-Host "AIGRA Ops is now running!"
Write-Host "Backend: http://localhost:8000"
Write-Host "Frontend: http://localhost:3000"

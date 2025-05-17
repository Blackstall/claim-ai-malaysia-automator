# Damage Analysis API

This API uses the QWEN-VL-Plus model from DashScope (Alibaba Cloud) to analyze images and determine the severity of damage visible in them. The API returns a damage severity score between 0 and 1.

## Setup

1. Get your DashScope API key:
   - Go to https://dashscope.aliyun.com/
   - Sign up or log in
   - Navigate to API Keys in your account settings
   - Create a new API key

2. Create a `.env` file in the project root and add your API key:
```bash
DASHSCOPE_API_KEY=your_api_key_here
```

3. Install the required dependencies:
```bash
pip install -r requirements.txt
```

4. Run the FastAPI server:
```bash
python main.py
```

The server will start on `http://localhost:8000`

## API Usage

### Endpoint: POST /analyze-damage

Send a POST request with an image file to analyze the damage severity.

#### Request Format:
- Method: POST
- URL: `http://localhost:8000/analyze-damage`
- Content-Type: multipart/form-data
- Body: Form data with key 'file' containing the image file

#### Example using curl:
```bash
curl -X POST -F "file=@path/to/your/image.jpg" http://localhost:8000/analyze-damage
```

#### Example using Python requests:
```python
import requests

url = "http://localhost:8000/analyze-damage"
files = {"file": open("path/to/your/image.jpg", "rb")}
response = requests.post(url, files=files)
print(response.json())
```

#### Response Format:
```json
{
    "damage_severity_score": 0.75
}
```

The damage_severity_score ranges from 0 to 1, where:
- 0 means no visible damage
- 1 means extremely severe or total damage

## API Documentation

Once the server is running, you can access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc` 
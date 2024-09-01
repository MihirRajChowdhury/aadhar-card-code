const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint to upload Aadhaar image and process it with OCR
app.post('/upload', upload.single('aadhaarImage'), async (req, res) => {
  try {
    // Check if file is present
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Process the image with Tesseract.js
    const { data: { text } } = await Tesseract.recognize(req.file.buffer, 'eng', {
      logger: (m) => console.log(m), // Optional: Log progress
    });

    // Parse the OCR output to extract relevant information
    const name = extractName(text);
    const aadhaarNumber = extractAadhaarNumber(text);

    // Return the extracted information as JSON
    return res.json({ name, aadhaarNumber });
  } catch (error) {
    console.error('Error processing image:', error);
    return res.status(500).json({ error: 'Failed to process image' });
  }
});

// Function to extract Name from OCR output
const extractName = (text) => {
  const nameMatch = text.match(/Name:\s*([A-Za-z\s]+)/);
  return nameMatch ? nameMatch[1].trim() : 'Name not found';
};

// Function to extract Aadhaar Number from OCR output
const extractAadhaarNumber = (text) => {
  const aadhaarMatch = text.match(/\b\d{4}\s\d{4}\s\d{4}\b/);
  return aadhaarMatch ? aadhaarMatch[0] : 'Aadhaar Number not found';
};

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

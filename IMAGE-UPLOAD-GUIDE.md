# Image Upload & Compression Guide

## Overview
The admin dashboard now supports image uploads with automatic compression for both product images and crypto payment QR codes.

## Features Added

### 1. Product Management - Image Uploads
- **Location**: Admin Dashboard → Product Management → Add/Edit Product
- **Features**:
  - Upload multiple product images
  - Automatic compression to reduce file size
  - Image preview with delete option
  - Supports JPEG, PNG, WebP formats
  - Maximum 5MB per image before compression
  - Compressed to max 800x600px at 80% quality

### 2. Crypto Settings - QR Code Uploads
- **Location**: Admin Dashboard → Crypto Settings
- **Features**:
  - Upload Bitcoin and USDT QR codes
  - Automatic compression optimized for QR codes
  - Higher quality (90%) to maintain QR code readability
  - PNG format for better QR code clarity
  - Maximum 2MB per image before compression
  - Compressed to max 400x400px
  - File size display after compression

## How to Use

### Product Images
1. Go to Admin Dashboard → Product Management
2. Click "Add Product" or edit an existing product
3. Scroll to "Product Images" section
4. Click "Upload Images" button
5. Select one or more image files
6. Images will be automatically compressed and displayed
7. Use the X button to remove unwanted images
8. Save the product

### Crypto QR Codes
1. Go to Admin Dashboard → Crypto Settings
2. Find Bitcoin or USDT sections
3. Click "Upload QR Code" button under the respective section
4. Select your QR code image
5. Image will be compressed and displayed with file size
6. Click "Save Settings" to apply changes

## Technical Details

### Image Compression Settings

#### Product Images
- **Max Dimensions**: 800x600 pixels
- **Quality**: 80%
- **Format**: JPEG (for smaller file sizes)
- **Max Input Size**: 5MB

#### QR Codes
- **Max Dimensions**: 400x400 pixels
- **Quality**: 90% (higher for readability)
- **Format**: PNG (better for QR codes)
- **Max Input Size**: 2MB

### Supported Formats
- JPEG/JPG
- PNG
- WebP
- GIF (input only, converted to JPEG/PNG)

### File Size Reduction
- Typical compression reduces file sizes by 60-80%
- QR codes maintain high quality for scanning
- Product images optimized for web display
- File sizes displayed after compression

## Benefits
1. **Faster Loading**: Compressed images load faster on the website
2. **Storage Efficiency**: Reduced server storage requirements
3. **Better UX**: Automatic compression without quality loss
4. **Mobile Friendly**: Optimized images work better on mobile devices
5. **Bandwidth Savings**: Smaller images use less bandwidth

## Troubleshooting

### Common Issues
1. **"File too large"**: Reduce image size before upload or use a different image
2. **"Invalid file type"**: Only image files are supported
3. **"Failed to process"**: Try a different image or refresh the page

### Best Practices
1. Use high-quality source images for best results
2. QR codes should have good contrast (black on white)
3. Product images should be well-lit and clear
4. Avoid extremely large images (>10MB) for faster processing

## File Locations
- Image compression utility: `client/src/utils/imageCompression.js`
- Product management: `client/src/components/admin/ProductManagement.js`
- Crypto settings: `client/src/components/admin/CryptoSettings.js`
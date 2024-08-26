const dropzone = document.getElementById('dropzone');

// Handle drag and drop events
dropzone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropzone.style.borderColor = '#333';
    dropzone.style.color = '#333';
});

dropzone.addEventListener('dragleave', () => {
    dropzone.style.borderColor = '#ccc';
    dropzone.style.color = '#aaa';
});

dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropzone.style.borderColor = '#ccc';
    dropzone.style.color = '#aaa';
    handleFiles(event.dataTransfer.files);
});

// Handle click to open file dialog
dropzone.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = () => handleFiles(fileInput.files);
    fileInput.click();
});

function handleFiles(files) {
    const file = files[0];
    if (file) {
        displayFileData(file); // Display basic file properties

        const reader = new FileReader();
        reader.onload = function (e) {
            // Display the image in the dropzone
            dropzone.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image">`;

            const image = new Image();
            image.onload = function () {
                displayImageProperties(image); // Display image properties
                EXIF.getData(image, function () {
                    const exifData = EXIF.getAllTags(this);
                    console.log('EXIF Data:', exifData); // Debugging line
                    displayExifData(exifData); // Display EXIF data (if available)
                    displayLatitudeLongitude(exifData, image); // Display Latitude and Longitude
                    displayAdditionalData(image, file); // Display additional data
                });
            };
            image.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        document.getElementById('latitudeLongitude').innerHTML = '';
        document.getElementById('fileData').innerHTML = '<p>No file selected.</p>';
        document.getElementById('exifData').innerHTML = '';
        document.getElementById('additionalData').innerHTML = '';
    }
}

function displayFileData(file) {
    const fileDataDiv = document.getElementById('fileData');
    const fileSizeKB = (file.size / 1024).toFixed(2);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const fileData = `
        <table>
            <tr><th>FileName</th><td>${file.name}</td></tr>
            <tr><th>FileSize</th><td>${fileSizeKB} KB (${fileSizeMB} MB)</td></tr>
            <tr><th>FileType</th><td>${file.type}</td></tr>
            <tr><th>FileLastModifiedDate</th><td>${new Date(file.lastModified).toLocaleString()}</td></tr>
        </table>
    `;
    fileDataDiv.innerHTML = fileData;
}

function displayImageProperties(image) {
    const exifDataDiv = document.getElementById('exifData');
    const imageData = `
        <table>
            <tr><th>ImageWidth</th><td>${image.width}px</td></tr>
            <tr><th>ImageHeight</th><td>${image.height}px</td></tr>
            <tr><th>ImageSize</th><td>${(image.width * image.height / 1000000).toFixed(2)} Megapixels</td></tr>
        </table>
    `;
    exifDataDiv.innerHTML = imageData;
}

function displayExifData(data) {
    const exifDataDiv = document.getElementById('exifData');
    if (Object.keys(data).length > 0) {
        let html = '<table>';
        for (const [key, value] of Object.entries(data)) {
            html += `<tr><th>${key}</th><td>${value}</td></tr>`;
        }
        html += '</table>';
        exifDataDiv.innerHTML += html; // Append to the existing data
    }
}

function displayLatitudeLongitude(exifData, image) {
    const latitudeLongitudeDiv = document.getElementById('latitudeLongitude');
    
    if (exifData.GPSLatitude && exifData.GPSLongitude && exifData.GPSLatitudeRef && exifData.GPSLongitudeRef) {
        // If GPS data exists, use it
        const lat = convertDMSToDD(exifData.GPSLatitude, exifData.GPSLatitudeRef);
        const lon = convertDMSToDD(exifData.GPSLongitude, exifData.GPSLongitudeRef);
        const gpsHtml = `
            <h3>Latitude and Longitude</h3>
            <p>Latitude: ${lat} ${exifData.GPSLatitudeRef}</p>
            <p>Longitude: ${lon} ${exifData.GPSLongitudeRef}</p>
        `;
        latitudeLongitudeDiv.innerHTML = gpsHtml;
    } else {
        // Simulate Lat/Lon based on the image dimensions
        const lat = simulateLatitude(image.width);
        const lon = simulateLongitude(image.height);
        const simulatedHtml = `
            <h3>Simulated Latitude and Longitude</h3>
            <p>Latitude: ${lat}</p>
            <p>Longitude: ${lon}</p>
        `;
        latitudeLongitudeDiv.innerHTML = simulatedHtml;
    }
}

function displayAdditionalData(image, file) {
    const additionalDataDiv = document.getElementById('additionalData');
    let additionalData = `
        <table>
            <tr><th>BitDepth</th><td>${image.naturalWidth > 0 ? "8 (typical)" : "Unknown"}</td></tr>
            <tr><th>ColorType</th><td>${file.type.includes("jpeg") ? "YCbCr" : "RGBA (typical)"}</td></tr>
            <tr><th>Compression</th><td>${file.type.includes("jpeg") ? "JPEG" : "Deflate (PNG)"}</td></tr>
            <tr><th>Filter</th><td>Adaptive (for PNG)</td></tr>
            <tr><th>Interlace</th><td>${file.type.includes("png") ? "None" : "Progressive (JPEG)"}</td></tr>
            <tr><th>SRGBRendering</th><td>Perceptual (typical)</td></tr>
            <tr><th>Gamma</th><td>2.2 (standard for sRGB)</td></tr>
            <tr><th>PixelsPerUnitX</th><td>Unknown</td></tr>
            <tr><th>PixelsPerUnitY</th><td>Unknown</td></tr>
            <tr><th>PixelUnits</th><td>Unknown</td></tr>
            <tr><th>ImageSize</th><td>${image.width} x ${image.height}</td></tr>
            <tr><th>Megapixels</th><td>${(image.width * image.height / 1000000).toFixed(2)} Megapixels</td></tr>
        </table>
    `;
    additionalDataDiv.innerHTML = additionalData;
}

// Helper function to convert DMS (Degrees, Minutes, Seconds) to Decimal Degrees
function convertDMSToDD(dmsArray, ref) {
    const degrees = dmsArray[0].numerator;
    const minutes = dmsArray[1].numerator;
    const seconds = dmsArray[2].numerator / dmsArray[2].denominator;
    let dd = degrees + minutes / 60 + seconds / 3600;

    if (ref === "S" || ref === "W") {
        dd = dd * -1;
    }
    return dd.toFixed(6);
}

// Simulate Latitude based on image width
function simulateLatitude(width) {
    return (width % 90).toFixed(6);
}

// Simulate Longitude based on image height
function simulateLongitude(height) {
    return (height % 180).toFixed(6);
}
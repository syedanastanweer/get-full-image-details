<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Read Full Image Data </title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>

<body>
    <div class="container">
        <h2>Upload Image to Read Full Data</h2>
        <div id="dropzone" class="dropzone">Drag & Drop Image Here or Click to Select</div>
        <div id="latitudeLongitude"></div>
        <div id="fileData"></div>
        <div id="exifData"></div>
        <div id="additionalData"></div>
    </div>
    <!-- Include the exif-js library -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/exif-js/2.3.0/exif.min.js"></script>
    <script src="assets/js/script.js"> </script>
</body>

</html>

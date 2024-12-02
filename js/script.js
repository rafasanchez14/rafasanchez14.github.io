// Cargar imágenes en el collage
document.getElementById('imageUpload').addEventListener('change', function(event) {
    const files = event.target.files;
    const collage = document.getElementById('collage');
    const footerDate = document.getElementById('footerDate');
    collage.innerHTML = ''; // Limpiar el collage anterior

    if (files.length > 6) {
        alert('Por favor, selecciona máximo 6 imágenes.');
        return;
    }

    // Extraer la fecha de la primera foto
    const firstFile = files[0];
    if (firstFile) {
        EXIF.getData(firstFile, function() {
            const dateTime = EXIF.getTag(this, 'DateTime');
            footerDate.textContent = dateTime
                ? `Fecha: ${formatExifDate(dateTime)}`
                : 'Fecha: Desconocida';
        });
    }

    // Procesar cada foto para mostrar en el collage
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.classList.add('collage-img');

            // Extraer metadatos de cada imagen
            EXIF.getData(file, function() {
                const dateTime = EXIF.getTag(this, 'DateTime');
                const formattedTime = dateTime
                    ? formatExifTime(dateTime)
                    : 'Hora desconocida';

                // Crear contenedor con la hora
                const item = document.createElement('div');
                item.classList.add('collage-item');

                const timeText = document.createElement('div');
                timeText.classList.add('photo-time');
                timeText.textContent = formattedTime;

                item.appendChild(img);
                item.appendChild(timeText);
                collage.appendChild(item);
            });
        };
        reader.readAsDataURL(file);
    });
});

// Formatear fecha EXIF a DD/MM/YYYY
function formatExifDate(dateString) {
    const parts = dateString.split(' '); // Divide fecha y hora
    const dateParts = parts[0].split(':'); // Divide año, mes, día
    return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`; // Retorna en formato DD/MM/YYYY
}

// Formatear hora desde la fecha EXIF
function formatExifTime(dateString) {
    const parts = dateString.split(' '); // Divide fecha y hora
    return parts[1]; // Retorna solo la hora
}

// Descargar el collage como una imagen
document.getElementById('downloadCollage').addEventListener('click', function() {
    const collageContainer = document.getElementById('collageContainer');

    html2canvas(collageContainer).then(canvas => {
        // Crear un enlace para descargar
        const link = document.createElement('a');
        link.download = 'collage.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});

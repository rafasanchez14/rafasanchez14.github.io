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

    const today = new Date();
    footerDate.textContent = `Fecha: ${today.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}`;

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.classList.add('collage-img');

            // Extraer metadatos de la imagen
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

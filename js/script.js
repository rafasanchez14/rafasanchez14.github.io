// Cargar imágenes en el collage
document.getElementById('imageUpload').addEventListener('change', function(event) {
    const files = Array.from(event.target.files); // Convertir FileList a array
    const collage = document.getElementById('collage');
    const footerDate = document.getElementById('footerDate');
    collage.innerHTML = ''; // Limpiar el collage anterior

    if (files.length > 6) {
        alert('Por favor, selecciona máximo 6 imágenes.');
        return;
    }

    // Array para almacenar información de imágenes con sus metadatos
    const imagesWithMetadata = [];

    // Procesar cada foto
    files.forEach((file, index) => {
        EXIF.getData(file, function() {
            const dateTime = EXIF.getTag(this, 'DateTime') || 'Fecha desconocida';
            const formattedTime = dateTime !== 'Fecha desconocida' ? formatExifTime(dateTime) : null;
            const formattedDate = dateTime !== 'Fecha desconocida' ? formatExifDate(dateTime) : null;

            imagesWithMetadata.push({
                file,
                time: formattedTime, // Hora extraída
                date: formattedDate, // Fecha extraída
                index, // Índice original para desempates si hay horas iguales
            });

            // Si se procesaron todas las imágenes, ordenar y mostrar
            if (imagesWithMetadata.length === files.length) {
                displayImages(imagesWithMetadata);
            }
        });
    });

    // Mostrar imágenes en el collage ordenadas por hora
    function displayImages(images) {
        // Ordenar por hora (si no hay hora, se considera al final)
        images.sort((a, b) => {
            if (!a.time) return 1;
            if (!b.time) return -1;
            return a.time.localeCompare(b.time) || a.index - b.index;
        });

        // Mostrar la fecha de la primera foto en el pie del collage
        const firstImageWithDate = images.find(image => image.date);
        footerDate.textContent = firstImageWithDate
            ? `Fecha: ${firstImageWithDate.date}`
            : 'Fecha: Desconocida';

        // Crear el collage con las fotos ordenadas
        images.forEach(({ file, time }) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;

                const item = document.createElement('div');
                item.classList.add('collage-item');

                const timeText = document.createElement('div');
                timeText.classList.add('photo-time');
                timeText.textContent = time || 'Hora desconocida';

                item.appendChild(img);
                item.appendChild(timeText);
                collage.appendChild(item);
            };
            reader.readAsDataURL(file);
        });
    }
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

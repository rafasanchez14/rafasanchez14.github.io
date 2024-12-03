// Cargar imágenes en el collage
document.getElementById('imageUpload').addEventListener('change', function (event) {
    const files = Array.from(event.target.files); // Convertir FileList a array
    const collage = document.getElementById('collage');
    const footerDate = document.getElementById('footerDate');
    collage.innerHTML = ''; // Limpiar el collage anterior

    if (files.length > 6) {
        alert('Por favor, selecciona máximo 6 imágenes.');
        return;
    }

    const imagesWithMetadata = [];

    // Procesar cada foto
    files.forEach((file, index) => {
        EXIF.getData(file, function () {
            const dateTime = EXIF.getTag(this, 'DateTime') || null;
            const fullDate = dateTime ? parseExifDate(dateTime) : null;

            imagesWithMetadata.push({
                file,
                date: fullDate, // Fecha completa extraída (objeto Date)
                rawDate: dateTime, // Fecha original en formato EXIF
                index, // Índice original
            });

            // Cuando todas las imágenes se han procesado, mostrar en orden
            if (imagesWithMetadata.length === files.length) {
                displayImages(imagesWithMetadata);
            }
        });
    });

    // Mostrar imágenes en el collage en el orden de selección
    function displayImages(images) {
        // Mostrar la fecha de la primera imagen (selección) en el pie del collage
        const firstImageWithDate = images[0]; // Primera imagen seleccionada
        footerDate.textContent = firstImageWithDate.date
            ? `Fecha: ${formatDateForDisplay(firstImageWithDate.date)}`
            : 'Fecha: Desconocida';

        // Crear el collage con las fotos en orden de selección
        images.forEach(({ file, rawDate }) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = document.createElement('img');
                img.src = e.target.result;

                const item = document.createElement('div');
                item.classList.add('collage-item');

                const timeText = document.createElement('div');
                timeText.classList.add('photo-time');
                timeText.textContent = rawDate ? formatExifTime(rawDate) : 'Hora desconocida';

                item.appendChild(img);
                item.appendChild(timeText);
                collage.appendChild(item);
            };
            reader.readAsDataURL(file);
        });
    }
});

// Parsear fecha EXIF a un objeto Date
function parseExifDate(dateString) {
    try {
        const parts = dateString.split(' '); // Divide fecha y hora
        const dateParts = parts[0].split(':'); // Divide año, mes, día
        const timeParts = parts[1].split(':'); // Divide hora, minutos, segundos
        return new Date(
            parseInt(dateParts[0]),
            parseInt(dateParts[1]) - 1,
            parseInt(dateParts[2]),
            parseInt(timeParts[0]),
            parseInt(timeParts[1]),
            parseInt(timeParts[2])
        );
    } catch (e) {
        console.error('Error al parsear la fecha EXIF:', dateString, e);
        return null;
    }
}

// Formatear fecha para mostrar (DD/MM/YYYY)
function formatDateForDisplay(date) {
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

// Formatear hora desde la fecha EXIF
function formatExifTime(dateString) {
    const parts = dateString.split(' '); // Divide fecha y hora
    return parts[1]; // Retorna solo la hora
}

// Descargar el collage como una imagen
document.getElementById('downloadCollage').addEventListener('click', function () {
    const collageContainer = document.getElementById('collageContainer');

    html2canvas(collageContainer).then(canvas => {
        canvas.toBlob(blob => {
            const link = document.createElement('a');
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            if (isMobile) {
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank'); // Abrir en nueva pestaña en móviles
            } else {
                link.download = 'collage.png';
                link.href = URL.createObjectURL(blob);
                link.click();
            }
        }, 'image/png');
    });
});

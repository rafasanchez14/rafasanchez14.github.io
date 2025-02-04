// Cargar imágenes en el collage
document.getElementById('imageUpload').addEventListener('change', function (event) {
    const files = Array.from(event.target.files); // Convertir FileList a array
    const collage = document.getElementById('collage');
    const footerDate = document.getElementById('footerDate');
    collage.innerHTML = ''; // Limpiar el collage anterior

    if (files.length > 9) {
        alert('Por favor, selecciona máximo 9 imágenes.');
        return;
    }

    // Array para almacenar información de imágenes con sus metadatos
    const imagesWithMetadata = [];

    // Procesar cada foto
    files.forEach((file, index) => {
        const lastModifiedDate = new Date(file.lastModified);
        const year = lastModifiedDate.getFullYear();
        const month = String(lastModifiedDate.getMonth() + 1).padStart(2, '0'); // Mes (base 0)
        const day = String(lastModifiedDate.getDate()).padStart(2, '0');
        const hours = String(lastModifiedDate.getHours()).padStart(2, '0');
        const minutes = String(lastModifiedDate.getMinutes()).padStart(2, '0');
        const seconds = String(lastModifiedDate.getSeconds()).padStart(2, '0');

        // Formato EXIF: YYYY:MM:DD HH:MM:SS
        const exifDate = `${year}:${month}:${day} ${hours}:${minutes}:${seconds}`;

        EXIF.getData(file, function () {
            const dateTime = exifDate|| null;
            const fullDate = dateTime ? lastModifiedDate : null;

            imagesWithMetadata.push({
                file,
                date: fullDate, // Fecha completa extraída (objeto Date)
                rawDate: dateTime, // Fecha original en formato EXIF
                index, // Índice original para desempates si es necesario
            });

            // Si se procesaron todas las imágenes, ordenar y mostrar
            if (imagesWithMetadata.length === files.length) {
                displayImages(imagesWithMetadata);
            }
        });
    });

    // Mostrar imágenes en el collage ordenadas por fecha
    function displayImages(images) {
        // Ordenar por fecha (si no hay fecha, se considera al final)
        images.sort((a, b) => {
            if (!a.date) return 1; // Sin fecha al final
            if (!b.date) return -1; // Sin fecha al final
            return a.date - b.date || a.index - b.index; // Comparar fechas y desempatar por índice
        });

        
        // Mostrar la fecha de la primera foto en el pie del collage
        const firstImageWithDate = images.find(image => image.date);
        footerDate.textContent = firstImageWithDate
            ? `Fecha: ${formatDateForDisplay(firstImageWithDate.date)}`
            : 'Fecha: Desconocida';

        console.log(images);
        // Crear el collage con las fotos ordenadas
        processImages(images);
    }
});

// Parsear fecha EXIF a un objeto Date
function parseExifDate(dateString) {
    const parts = dateString.split(' '); // Divide fecha y hora
    const dateParts = parts[0].split(':'); // Divide año, mes, día
    const timeParts = parts[1].split(':'); // Divide hora, minutos, segundos
    return new Date(
        parseInt(dateParts[0]), // Año
        parseInt(dateParts[1]) - 1, // Mes (base 0)
        parseInt(dateParts[2]), // Día
        parseInt(timeParts[0]), // Hora
        parseInt(timeParts[1]), // Minutos
        parseInt(timeParts[2]) // Segundos
    );
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
document.getElementById('shareCollage').addEventListener('click', async function () {
    const collageContainer = document.getElementById('collageContainer');

    html2canvas(collageContainer).then(async canvas => {
        const dataUrl = canvas.toDataURL('image/png'); // Convertir a Base64

        // Convertir Base64 a Blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], 'collage.png', { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Mi Collage',
                text: 'Descarga y guarda este collage en tu galería.'
            });
        } else {
            // Si no es compatible, descargar como antes
            const link = document.createElement('a');
            link.download = 'collage.png';
            link.href = dataUrl;
            link.click();
        }
    });
});

// Descargar el collage como una imagen
document.getElementById('downloadCollage').addEventListener('click', function () {
    const collageContainer = document.getElementById('collageContainer');

    html2canvas(collageContainer).then(canvas => {
        // Crear un enlace para descargar
        const link = document.createElement('a');
        link.download = 'collage.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});
const processImages = async (images) => {
    for (const { file, rawDate } of images) {
        const reader = new FileReader();
        const result = await new Promise((resolve, reject) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        // Ahora que el archivo se ha leído, podemos continuar con el resto del procesamiento
        console.log(rawDate);

        const img = document.createElement('img');
        img.src = result;

        const item = document.createElement('div');
        item.classList.add('collage-item');

        const timeText = document.createElement('div');
        timeText.classList.add('photo-time');
        timeText.textContent = rawDate ? formatExifTime(rawDate) : 'Hora desconocida';
        
        item.appendChild(img);
        item.appendChild(timeText);
        collage.appendChild(item);
    }
};



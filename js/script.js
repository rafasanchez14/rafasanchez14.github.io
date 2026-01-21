// Cargar imágenes en el collage
document.getElementById('imageUpload').addEventListener('change', function (event) {
    const files = Array.from(event.target.files); // Convertir FileList a array
    const collage = document.getElementById('collage');
    const footerDate = document.getElementById('footerDate');
    collage.innerHTML = ''; // Limpiar el collage anterior

    if (files.length > 8) {
        alert('Por favor, selecciona máximo 8 imágenes (se agregará un recuadro de texto).');
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
            const dateTime = exifDate || null;
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
document.getElementById('shareCollage').addEventListener('click', async function (event) {
    const collageContainer = document.getElementById('collageContainer');
    const textarea = collageContainer.querySelector('.collage-textarea');
    
    event.preventDefault();
    
    // Convertir textarea a div para captura
    let textDiv = null;
    let originalParent = null;
    if (textarea && textarea.value.trim()) {
        originalParent = textarea.parentElement;
        textDiv = document.createElement('div');
        textDiv.style.cssText = `
            width: 100%;
            height: auto !important;
            min-height: 180px;
            max-height: none !important;
            border: 2px dashed #ccc;
            border-radius: 8px;
            padding: 15px;
            font-family: 'Poppins', sans-serif;
            font-size: 13px;
            line-height: 1.5;
            background-color: white;
            box-sizing: border-box;
            word-wrap: break-word;
            white-space: pre-wrap;
            overflow: visible !important;
            color: #333;
            text-align: left;
            display: block;
        `;
        textDiv.textContent = textarea.value;
        textarea.style.display = 'none';
        originalParent.appendChild(textDiv);
        
        // Forzar que el item contenedor también se expanda
        originalParent.style.height = 'auto';
        originalParent.style.minHeight = 'auto';
    }
    
    // Delay más largo para asegurar renderizado completo
    await new Promise(resolve => setTimeout(resolve, 300));
    
    html2canvas(collageContainer, {
        scale: 2,
        useCORS: true,
        logging: true,
        windowHeight: collageContainer.scrollHeight,
        height: collageContainer.scrollHeight
    }).then(async canvas => {
        // Restaurar el textarea
        if (textarea && textDiv) {
            textarea.style.display = '';
            textDiv.remove();
            originalParent.style.height = '';
            originalParent.style.minHeight = '';
        }
        
        const dataUrl = canvas.toDataURL('image/png');
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], 'collage.png', { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({ files: [file], title: 'comidas', text: 'Te comparto mis comidas' });
            } catch (err) {
                console.error("Error al compartir:", err);
            }
        } else {
            const link = document.createElement('a');
            link.download = 'collage.png';
            link.href = dataUrl;
            link.click();
        }
    });
});

// Descargar el collage como una imagen
document.getElementById('downloadCollage').addEventListener('click', async function () {
    const collageContainer = document.getElementById('collageContainer');
    const textarea = collageContainer.querySelector('.collage-textarea');
    
    // Convertir textarea a div para captura
    let textDiv = null;
    let originalParent = null;
    if (textarea && textarea.value.trim()) {
        originalParent = textarea.parentElement;
        textDiv = document.createElement('div');
        textDiv.style.cssText = `
            width: 100%;
            height: auto !important;
            min-height: 180px;
            max-height: none !important;
            border: 2px dashed #ccc;
            border-radius: 8px;
            padding: 15px;
            font-family: 'Poppins', sans-serif;
            font-size: 13px;
            line-height: 1.5;
            background-color: white;
            box-sizing: border-box;
            word-wrap: break-word;
            white-space: pre-wrap;
            overflow: visible !important;
            color: #333;
            text-align: left;
            display: block;
        `;
        textDiv.textContent = textarea.value;
        textarea.style.display = 'none';
        originalParent.appendChild(textDiv);
        
        // Forzar que el item contenedor también se expanda
        originalParent.style.height = 'auto';
        originalParent.style.minHeight = 'auto';
    }
    
    // Delay más largo para asegurar renderizado completo
    await new Promise(resolve => setTimeout(resolve, 300));

    html2canvas(collageContainer, {
        scale: 2,
        useCORS: true,
        logging: true,
        windowHeight: collageContainer.scrollHeight,
        height: collageContainer.scrollHeight
    }).then(canvas => {
        // Restaurar el textarea
        if (textarea && textDiv) {
            textarea.style.display = '';
            textDiv.remove();
            originalParent.style.height = '';
            originalParent.style.minHeight = '';
        }
        
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

    // Agregar el recuadro de texto al final
    const textItem = document.createElement('div');
    textItem.classList.add('collage-item', 'text-box-item');
    
    const textArea = document.createElement('textarea');
    textArea.classList.add('collage-textarea');
    textArea.placeholder = 'Escribe aquí tus notas...';
    textArea.setAttribute('maxlength', '500');
    
    // Función para ajustar la altura del textarea automáticamente
    function adjustTextareaHeight() {
        textArea.style.height = 'auto';
        textArea.style.height = Math.max(180, textArea.scrollHeight) + 'px';
    }
    
    // Ajustar altura cuando el usuario escribe
    textArea.addEventListener('input', adjustTextareaHeight);
    
    // Ajustar altura inicial
    adjustTextareaHeight();
    
    textItem.appendChild(textArea);
    collage.appendChild(textItem);
};

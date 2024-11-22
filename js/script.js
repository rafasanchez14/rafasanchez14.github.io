// Cargar imágenes en el collage
document.getElementById('imageUpload').addEventListener('change', function(event) {
    const files = event.target.files;
    const collage = document.getElementById('collage');
    collage.innerHTML = ''; // Limpiar el collage anterior
    
    if (files.length > 6) {
        alert('Por favor, selecciona máximo 6 imágenes.');
        return;
    }

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            collage.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
});

// Mostrar la fecha actual
const dateText = document.getElementById('dateText');
const today = new Date();
const formattedDate = today.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});
dateText.textContent = `Fecha: ${formattedDate}`;

// Descargar el collage como una imagen
document.getElementById('downloadCollage').addEventListener('click', function() {
    const dateText = document.getElementById('dateText');
    dateText.hidden = false;
    const collageContainer = document.getElementById('collageContainer');
    
    html2canvas(collageContainer).then(canvas => {
        // Crear un enlace para descargar
        const link = document.createElement('a');
        link.download = 'collage.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});

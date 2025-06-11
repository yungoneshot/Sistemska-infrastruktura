document.addEventListener('DOMContentLoaded', function() {
    // Navigacija između sekcija
    const sections = {
        homeBtn: document.getElementById('home'),
        notesBtn: document.getElementById('notes'),
        glucoseBtn: document.getElementById('glucose'),
        contactBtn: document.getElementById('contact'),
        loginBtn: document.getElementById('login')
    };

    const navButtons = {
        homeBtn: document.getElementById('homeBtn'),
        notesBtn: document.getElementById('notesBtn'),
        glucoseBtn: document.getElementById('glucoseBtn'),
        contactBtn: document.getElementById('contactBtn'),
        loginBtn: document.getElementById('loginBtn')
    };

    // Funkcija za prikaz odabrane sekcije
    function showSection(sectionId) {
        // Sakrij sve sekcije
        Object.values(sections).forEach(section => {
            section.classList.remove('active');
        });
        
        // Ukloni aktivnu klasu sa svih gumba
        Object.values(navButtons).forEach(button => {
            button.classList.remove('active');
        });
        
        // Prikaži odabranu sekciju
        sections[sectionId].classList.add('active');
        navButtons[sectionId].classList.add('active');
    }

    // Dodaj event listenere na gumbe
    navButtons.homeBtn.addEventListener('click', () => showSection('homeBtn'));
    navButtons.notesBtn.addEventListener('click', () => showSection('notesBtn'));
    navButtons.glucoseBtn.addEventListener('click', () => {
        showSection('glucoseBtn');
        updateGlucoseChart(); // Osvježi graf prilikom otvaranja sekcije
    });
    navButtons.contactBtn.addEventListener('click', () => showSection('contactBtn'));
    navButtons.loginBtn.addEventListener('click', () => showSection('loginBtn'));

    // Bilješke - funkcionalnost
    const noteInput = document.getElementById('noteInput');
    const saveNoteBtn = document.getElementById('saveNoteBtn');
    const notesList = document.getElementById('notesList');

    // Učitaj bilješke iz localStorage
    function loadNotes() {
        const notes = JSON.parse(localStorage.getItem('medNotes')) || [];
        notesList.innerHTML = '';
        
        notes.forEach((note, index) => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note';
            noteElement.innerHTML = `
                <p>${note.text}</p>
                <p class="note-date">${new Date(note.date).toLocaleString()}</p>
                <button onclick="deleteNote(${index})" class="delete-btn">Obriši</button>
            `;
            notesList.appendChild(noteElement);
        });
    }

    // Spremi novu bilješku
    saveNoteBtn.addEventListener('click', function() {
        const noteText = noteInput.value.trim();
        if (noteText) {
            const notes = JSON.parse(localStorage.getItem('medNotes')) || [];
            notes.push({
                text: noteText,
                date: new Date().toISOString()
            });
            localStorage.setItem('medNotes', JSON.stringify(notes));
            noteInput.value = '';
            loadNotes();
        }
    });

    // Funkcija za brisanje bilješke (globalna da bi bila dostupna u HTML-u)
    window.deleteNote = function(index) {
        const notes = JSON.parse(localStorage.getItem('medNotes')) || [];
        notes.splice(index, 1);
        localStorage.setItem('medNotes', JSON.stringify(notes));
        loadNotes();
    };

    // Učitaj bilješke prilikom pokretanja
    loadNotes();

    // Praćenje glukoze - funkcionalnost
    const glucoseValue = document.getElementById('glucoseValue');
    const glucoseTime = document.getElementById('glucoseTime');
    const addGlucoseBtn = document.getElementById('addGlucoseBtn');
    let glucoseChart = null;

    // Postavi trenutno vrijeme kao početnu vrijednost
    const now = new Date();
    const timeString = now.toISOString().slice(0, 16);
    glucoseTime.value = timeString;

    // Učitaj mjerenja glukoze iz localStorage
    function getGlucoseData() {
        return JSON.parse(localStorage.getItem('glucoseData')) || [];
    }

    // Dodaj novo mjerenje glukoze
    addGlucoseBtn.addEventListener('click', function() {
        const value = parseFloat(glucoseValue.value);
        const time = glucoseTime.value;
        
        if (isNaN(value) || value <= 0 || value > 30) {
            alert('Unesite ispravnu vrijednost glukoze (0-30 mmol/L)');
            return;
        }
        
        if (!time) {
            alert('Unesite vrijeme mjerenja');
            return;
        }
        
        const glucoseData = getGlucoseData();
        glucoseData.push({
            value: value,
            time: time
        });
        
        localStorage.setItem('glucoseData', JSON.stringify(glucoseData));
        glucoseValue.value = '';
        glucoseTime.value = timeString; // Resetiraj na trenutno vrijeme
        
        updateGlucoseChart();
    });

    // Kreiraj ili ažuriraj graf glukoze
    function updateGlucoseChart() {
        const glucoseData = getGlucoseData();
        const ctx = document.getElementById('glucoseChart').getContext('2d');
        
        // Sortiraj podatke po datumu
        glucoseData.sort((a, b) => new Date(a.time) - new Date(b.time));
        
        const labels = glucoseData.map(item => new Date(item.time).toLocaleString());
        const data = glucoseData.map(item => item.value);
        
        if (glucoseChart) {
            glucoseChart.data.labels = labels;
            glucoseChart.data.datasets[0].data = data;
            glucoseChart.update();
        } else {
            glucoseChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Razina glukoze (mmol/L)',
                        data: data,
                        backgroundColor: 'rgba(52, 152, 219, 0.7)',
                        borderColor: 'rgba(52, 152, 219, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'mmol/L'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Vrijeme mjerenja'
                            }
                        }
                    }
                }
            });
        }
    }

    // Kontakt forma
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        // Ovdje bi se u stvarnoj aplikaciji poslalo na server
        alert(`Hvala ${name}, vaša poruka je poslana! Odgovoriti ćemo vam na email ${email} u najkraćem mogućem roku.`);
        contactForm.reset();
    });

    // Prijava forma
    const loginForm = document.getElementById('loginForm');
    const registerLink = document.getElementById('registerLink');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Ovdje bi se u stvarnoj aplikaciji provjerili podaci na serveru
        alert(`Prijava uspješna! Dobrodošli, ${username}.`);
        loginForm.reset();
        showSection('homeBtn');
    });
    
    registerLink.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Registracija nije implementirana u ovoj verziji.');
    });

    // Inicijalizacija grafa glukoze
    updateGlucoseChart();
});
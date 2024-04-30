$(document).ready(function() {
    console.log("Jquery Funktioniert");
    initializeFormAndHandleSubmission();
    loadAppointments();
    // Überprüfen Sie, ob Sie sich auf der Detailseite befinden und laden Sie die Details
    if (window.location.pathname.includes('details.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const appointmentId = urlParams.get('appointment_id');
        if (appointmentId) {
            loadAppointmentDetails(appointmentId);
        }
    }
});

function initializeFormAndHandleSubmission() {
    // Event-Handler nur einmal hinzufügen, außerhalb der anderen Funktion
    $('#buchen').off('click').on('click', function() {
        showAppointmentForm();
       
    });
}

// Funktion, um eine neue Terminoption im Formular hinzuzufügen
function addDateOption() {
    const dateOptionsContainer = $('#dateOptionsContainer');
    const newIndex = dateOptionsContainer.children().length / 3; // Jede Terminoption hat jetzt 3 Elemente (proposed_date, vote_start_date, vote_end_date)
    dateOptionsContainer.append(`
        <div class="mb-3">
            <label for="proposed_date_${newIndex}" class="form-label">Vorgeschlagenes Datum ${newIndex + 1}</label>
            <input type="datetime-local" class="form-control dateOption" data-index="${newIndex}" id="proposed_date_${newIndex}" required>
        </div>
        <div class="mb-3">
            <label for="vote_start_date_${newIndex}" class="form-label">Start der Abstimmung</label>
            <input type="datetime-local" class="form-control dateOption" data-index="${newIndex}" id="vote_start_date_${newIndex}" required>
        </div>
        <div class="mb-3">
            <label for="vote_end_date_${newIndex}" class="form-label">Ende der Abstimmung</label>
            <input type="datetime-local" class="form-control dateOption" data-index="${newIndex}" id="vote_end_date_${newIndex}" required>
        </div>
    `);
}

function showAppointmentForm() {
    const formHtml = `
            <div class="erstellung">
            <h3>Termin erstellen:</h3>
            <form id="createAppointmentForm">
                <div class="mb-3">
                    <label for="title" class="form-label">Titel</label>
                    <input type="text" class="form-control" id="title" required>
                </div>
                <div class="mb-3">
                    <label for="location" class="form-label">Ort</label>
                    <input type="text" class="form-control" id="location" required>
                </div>
                <div class="mb-3">
                    <label for="info" class="form-label">Informationen</label>
                    <textarea class="form-control" id="info" required></textarea>
                </div>
                <div class="mb-3">
                    <label for="duration" class="form-label">Dauer (in Minuten)</label>
                    <input type="number" class="form-control" id="duration" required>
                </div>
                <div class="mb-3">
                    <label for="creation_date" class="form-label">Erstellungsdatum</label>
                    <input type="datetime-local" class="form-control" id="creation_date" required>
                </div>
                <div class="mb-3">
                    <label for="voting_end_date" class="form-label">Enddatum der Abstimmung</label>
                    <input type="datetime-local" class="form-control" id="voting_end_date" required>
                </div>
                <div id="dateOptionsContainer">
                <!-- Hier werden die Terminoptionen eingefügt -->
                </div>
                <button type="button" onclick="addDateOption()" class="btn btn-secondary">Terminoption hinzufügen</button>
            
                <button type="submit" class="btn btn-primary">Termin speichern</button>
            </form>
            </div>
        `;
    // Das Formular wird in #formContainer eingefügt
    $('#formContainer').html(formHtml);

    // Event-Handler für das Submit-Event des Formulars
    $('#createAppointmentForm').off('submit').on('submit', function(e) {
        e.preventDefault();
        submitAppointment();
    });
}

function submitAppointment() 
{
    // Sammeln der Daten für die Terminoptionen
    const dateOptions = [];
    $('#dateOptionsContainer .dateOption').each(function(index, element) {
        // Stelle sicher, dass du alle drei Teile eines Datums gleichzeitig abrufst
        if (index % 3 === 0) 
        { // Jedes dritte Element ist ein neues Datum
            const proposedDate = $(element).val();
            const startDate = $(element).closest('.mb-3').next().find('.dateOption').val();
            const endDate = $(element).closest('.mb-3').next().next().find('.dateOption').val();
            dateOptions.push({
                proposed_date: proposedDate,
                vote_start_date: startDate,
                vote_end_date: endDate
            });
            console.log(dateOptions);

        }
    });

    // Sammeln der restlichen Termin-Daten
    const appointmentData = {
        title: $('#title').val(),
        location: $('#location').val(),
        info: $('#info').val(),
        duration: $('#duration').val(),
        creation_date: $('#creation_date').val(),
        voting_end_date: $('#voting_end_date').val(),
        dateOptions: dateOptions // Korrekte Schreibweise
    };

    console.log(appointmentData);  // Gibt die gesammelten Daten im Browser-Console-Log aus.
    
    // AJAX-Request an das Backend
    $.ajax({
        url: '/Appointment-Finder/backend/serviceHandler.php',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            method: "addAppointment",
            param: appointmentData // Hier übergeben wir das gesamte Objekt
        }),
        success: function(response) {
            alert('Termin erfolgreich hinzugefügt!');
            console.log('Server Response:', response);
            $('#formContainer').empty();
        },
        error: function(xhr, status, error) {
            alert('Fehler beim Hinzufügen des Termins: ' + error);
            console.error('Fehlerdetails:', xhr.responseText);
        }
    });
}


function loadAppointments() {
    $.ajax({
        url: '/Appointment-Finder/backend/serviceHandler.php',
        method: 'GET',
        data: { method: "getAllAppointments" },
        dataType: 'json', // Sagen Sie jQuery, dass es eine JSON-Antwort erwartet
        success: function(appointments) {
            displayAppointments(appointments); // Direkt das JavaScript-Objekt verwenden
        },
        error: function(xhr, status, error) {
            console.error("Fehler beim Anzeigen der Termine:", xhr.responseText);
        }
    });
}
function displayAppointments(appointments) {
    console.log("Gespeicherte Termine: ", appointments); // Zeigt die geladenen Termindaten in der Konsole an
    try {
        const tableBody = $('#appointmentsTable tbody');
        tableBody.empty();
        appointments.forEach(appointment => {
            const statusClass = new Date(appointment.voting_end_date) < new Date() ? 'expired' : 'active';
            const row = `<tr class="${statusClass}">
                <td>${appointment.title}</td>
                <td>${appointment.location}</td>
                <td><button onclick="location.href='details.html?appointment_id=${appointment.appointment_id}'">Details ansehen</button></td>
            </tr>`;
            tableBody.append(row);
        });
    } catch (e) {
        console.error("Es gab einen Fehler beim Parsen der Termine: ", e);
    }
}



function displayAppointmentDetails(details) {
    // Hier fügen Sie die Details des Termins in das DOM ein
    const detailsContainer = $('#appointmentDetails');
    detailsContainer.empty();

    // Termin Details
    const detailsHtml = `
        <h2>Details für ${details.title}</h2>
        <table class="table">
            <tr>
                <th>Titel</th>
                <td>${details.title}</td>
            </tr>
            <tr>
                <th>Ort</th>
                <td>${details.location}</td>
            </tr>
            <tr>
                <th>Information</th>
                <td>${details.info}</td>
            </tr>
            <tr>
                <th>Dauer</th>
                <td>${details.duration} Minuten</td>
            </tr>
            <tr>
                <th>Erstellungsdatum</th>
                <td>${new Date(details.creation_date).toLocaleString()}</td>
            </tr>
            <tr>
                <th>Enddatum der Abstimmung</th>
                <td>${new Date(details.voting_end_date).toLocaleString()}</td>
            </tr>
        </table>
    `;
    // Anzeige der verfügbaren Termine als Radiobuttons oder Checkboxes
    const datesHtml = details.availableDates.map(date => {
        return `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" name="dateOptions" value="${date.date_id}" id="dateOption${date.date_id}">
                <label class="form-check-label" for="dateOption${date.date_id}">
                    ${new Date(date.proposed_date).toLocaleString()}
                </label>
            </div>
        `;
    }).join('');

    

    // Fügen Sie das Abstimmungsformular hinzu
    detailsContainer.append(`
        <form id="votingForm">
            <h3>Wählen Sie einen Termin:</h3>
            ${datesHtml}
            <!-- ... (hier kommt der Code für die Eingabe von Name und Kommentar) ... -->
            <button type="submit" class="btn btn-primary">Abstimmen</button>
        </form>
    `);



   

    // Event-Handler für das Submit-Event des Abstimmungsformulars
    $('#votingForm').on('submit', function(e) {
        e.preventDefault();
        var voteData = {
            appointmentId: $('#appointmentId').val(), // Oder wie Sie die ID erhalten
            userName: $('#userName').val(),
            comment: $('#comment').val(),
            selectedDates: [] // Sie müssen die ausgewählten Daten hier einfügen
        };
    
        // Die ausgewählten Termindaten müssen hier gesammelt werden, z.B.:
        $('input[name="dateOptions"]:checked').each(function() {
            voteData.selectedDates.push($(this).val());
        });
    
        // Senden der Daten an das Backend
        submitVote(voteData);
    });

    // Funktion, um die Abstimmung zu verarbeiten (diese müssen Sie schreiben)
    function submitVote(voteData) {
        // Logik zum Erfassen der Abstimmungsdaten und Senden an das Backend
    }

    // Hier sollten Sie die Terminoptionen aus `details` durchlaufen und für jede eine Checkbox hinzufügen
    // Beispiel (Sie müssen dies entsprechend Ihrer Datenstruktur anpassen):
    details.availableDates.forEach(date => {
        $('#dateOptions').append(`
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="dateOption${date.date_id}">
                <label class="form-check-label" for="dateOption${date.date_id}">
                    ${new Date(date.proposed_date).toLocaleString()}
                </label>
            </div>
        `);
    });
}
function submitVote(voteData) {
    $.ajax({
        url: '/Appointment-Finder/backend/serviceHandler.php',
        method: 'POST', // Hier verwenden wir POST, um die Abstimmungsdaten zu senden
        contentType: 'application/json', // Wir senden die Daten als JSON
        data: JSON.stringify({
            method: "submitVote", // Diese Methode muss im Backend definiert sein
            param: voteData // Die Abstimmungsdaten
        }),
        success: function(response) {
            // Verarbeiten Sie hier die erfolgreiche Abstimmung
            console.log('Abstimmung erfolgreich:', response);
            alert('Ihre Stimme wurde erfolgreich abgegeben.');
        },
        error: function(xhr, status, error) {
            console.error("Fehler beim Senden der Abstimmung:", xhr.responseText);
            alert('Es gab ein Problem bei der Abstimmung: ' + error);
        }
    });
}


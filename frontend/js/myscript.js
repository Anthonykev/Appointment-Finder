$(document).ready(function() {
    console.log("hhhhhhh");
    initializeFormAndHandleSubmission();
});

function initializeFormAndHandleSubmission() {
    // Event-Handler nur einmal hinzufügen, außerhalb der anderen Funktion
    $('#buchen').off('click').on('click', function() {
        showAppointmentForm();
    });
}

function showAppointmentForm() {
    const formHtml = `
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
                <button type="submit" class="btn btn-primary">Termin speichern</button>
            </form>
        `;
    // Das Formular wird in #formContainer eingefügt
    $('#formContainer').html(formHtml);

    // Event-Handler für das Submit-Event des Formulars
    $('#createAppointmentForm').off('submit').on('submit', function(e) {
        e.preventDefault();
        submitAppointment();
    });
}

function submitAppointment() {
    const appointmentData = {
        method: "addAppointment",
        param: {
            title: $('#title').val(),
            location: $('#location').val(),
            info: $('#info').val(),
            duration: $('#duration').val(),
            creation_date: $('#creation_date').val(),
            voting_end_date: $('#voting_end_date').val()
        }
    };

    $.ajax({
        url: '/Appointment-Finder/backend/serviceHandler.php',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(appointmentData),
        success: function(response) {
            alert('Termin erfolgreich hinzugefügt!');
            console.log('Server Response:', response);
            $('#formContainer').empty(); // Das Formular entfernen
        },
        error: function(xhr, status, error) {
            alert('Fehler beim Hinzufügen des Termins: ' + error);
            console.error('Fehlerdetails:', xhr.responseText);
        }
    });
}

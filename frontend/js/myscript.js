$(document).ready(function() {
    console.log("Jquery Funktioniert");
    
    loadAppointments();
    // Event-Handler nur einmal hinzufügen, außerhalb der anderen Funktion
    $('#buchen').off('click').on('click', function() {
        showAppointmentForm();
       
    });
    // Überprüfen Sie, ob Sie sich auf der Detailseite befinden und laden Sie die Details
    const urlParams = new URLSearchParams(window.location.search);
    const appointmentId = urlParams.get('appointment_id');
    if (appointmentId) {
        loadAppointmentDetails(appointmentId);
    }
    
    //APP Löschen
    loadAppointmentsToDelete();

    // Event-Handler für das Löschen von Terminen, delegiert an das Table-Element
    $(document).on('click', '#appointmentDelete .delete-btn', function() {
        const appointmentId = $(this).data('appointment-id');
        deleteAppointment(appointmentId);
    });

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

function submitAppointment() {
    const dateOptions = [];
    $('#dateOptionsContainer .dateOption').each(function(index, element) {
        if (index % 3 === 0) { // Jedes dritte Element ist ein neues Datum
            const proposedDate = $(element).val();
            const startDate = $(element).closest('.mb-3').next().find('.dateOption').val();
            const endDate = $(element).closest('.mb-3').next().next().find('.dateOption').val();
            dateOptions.push({
                proposed_date: proposedDate,
                vote_start_date: startDate,
                vote_end_date: endDate
            });
        }
    });

    const appointmentData = {
        title: $('#title').val(),
        location: $('#location').val(),
        info: $('#info').val(),
        duration: $('#duration').val(),
        creation_date: $('#creation_date').val(),
        voting_end_date: $('#voting_end_date').val(),
        dateOptions: dateOptions
    };

    $.ajax({
        url: '/Appointment-Finder/backend/serviceHandler.php',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            method: "addAppointment",
            param: appointmentData
        }),
        success: function(response) {
            alert('Termin erfolgreich hinzugefügt!');
            $('#formContainer').empty();
            loadAppointments(); // Terminliste neu laden nach dem Hinzufügen
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


/*
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
}*/
function displayAppointments(appointments) {
    console.log("Gespeicherte Termine: ", appointments);
    const tableBody = $('#appointmentsTable tbody');
    tableBody.empty();
    appointments.forEach(appointment => {
        const now = new Date();
        const votingEndDate = new Date(appointment.voting_end_date);
        const isExpired = votingEndDate < now;
        const statusClass = isExpired ? 'expired' : 'active';
        const row = `<tr class="${statusClass}">
            <td>${appointment.title}</td>
            <td>${appointment.location}</td>
            <td>
                <button onclick="location.href='details.html?appointment_id=${appointment.appointment_id}'" ${isExpired ? 'disabled' : ''}>Details ansehen</button>
            </td>
        </tr>`;
        tableBody.append(row);
    });
}

// Lädt die Details für einen spezifischen Termin
function loadAppointmentDetails(appointmentId) {
    console.log("Lade Details für Termin ID:", appointmentId);
    $.ajax({
        url: '/Appointment-Finder/backend/serviceHandler.php',
        method: 'GET',
        data: {
            method: "getAppointmentDetails",
            param: { appointment_id: appointmentId }
        },
        dataType: 'json',
        success: function(details) {
            console.log("Termin Details geladen:", details);
            displayAppointmentDetails(details);
        },
        error: function(xhr, status, error) {
            console.error("Fehler beim Laden der Termin Details:", xhr.responseText);
            alert('Fehler beim Laden der Details: ' + error);
        }
    });
}

function displayAppointmentDetails(details) {
    const detailsContainer = $('#appointmentDetails');
    detailsContainer.empty();
    const now = new Date();
    const votingEndDate = new Date(details.voting_end_date);
    const isExpired = votingEndDate < now;

    if (!details || !details.appointment) {
        detailsContainer.append('<p>Keine Details verfügbar.</p>');
        return;
    }

    const { title, location, info, duration, creation_date, voting_end_date } = details.appointment;

    const detailsHtml = `
        <div class="container-fluid"
        <h2>Details für ${title}</h2>
        <table class="table">
            <tr><th>Titel</th><td>${title}</td></tr>
            <tr><th>Ort</th><td>${location}</td></tr>
            <tr><th>Information</th><td>${info}</td></tr>
            <tr><th>Dauer</th><td>${duration} Minuten</td></tr>
            <tr><th>Erstellungsdatum</th><td>${new Date(creation_date).toLocaleString()}</td></tr>
            <tr><th>Enddatum der Abstimmung</th><td>${new Date(voting_end_date).toLocaleString()}</td></tr>
        </table>
        </div>
    `;
    detailsContainer.append(detailsHtml);

    if (!isExpired) {
        const datesHtml = details.availableDates.map(date => `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" name="dateOptions" value="${date.date_id}" id="dateOption${date.date_id}">
                <label class="form-check-label" for="dateOption${date.date_id}">
                    ${new Date(date.proposed_date).toLocaleString()}
                </label>
            </div>
        `).join('');

        const votingFormHtml = `
            <form id="votingForm">
                <h3>Wählen Sie einen Termin:</h3>
                ${datesHtml}
                <input type="text" id="userName" placeholder="Ihr Name" required>
                <textarea id="comment" placeholder="Kommentar (optional)"></textarea>
                <button type="submit" class="btn btn-primary">Abstimmen</button>
            </form>
        `;
        detailsContainer.append(votingFormHtml);
    } else {
        detailsContainer.append('<p>Dieser Termin ist abgelaufen und kann nicht mehr gewählt werden.</p>');
    }
    // Event-Handler für das Submit-Event des Abstimmungsformulars
    $('#votingForm').on('submit', function(e) {
        e.preventDefault();
        var selectedDates = [];
        $('input[name="dateOptions"]:checked').each(function() {
            selectedDates.push($(this).val());
        });
    
        var voteData = {
            userName: $('#userName').val(),  // Stellen Sie sicher, dass ein Eingabefeld mit id="userName" existiert
            comment: $('#comment').val(),   // Stellen Sie sicher, dass ein Textbereich mit id="comment" existiert
            selectedDates: selectedDates
        };
    
        console.log(voteData);  // Überprüfen Sie die Ausgabe im Konsolen-Log
    
        submitVote(voteData);
    });
}

function submitVote(voteData) {
    $.ajax({
        url: '/Appointment-Finder/backend/serviceHandler.php',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            method: "submitVote",
            param: {
                selectedDateIds: voteData.selectedDates,
                userName: voteData.userName,
                comment: voteData.comment
            }
        }),
        success: function(response) {
            console.log('Abstimmung erfolgreich:', response);
            alert('Ihre Stimme wurde erfolgreich abgegeben. Sie werden in Kürze weitergeleitet.');

            // Setzen Sie hier die gewünschte Verzögerungszeit in Millisekunden (z.B. 3000 Millisekunden = 3 Sekunden)
            setTimeout(function() {
                window.location.href = 'index.html';  // Gehe zur Startseite
            }, 2000);  // 3000 Millisekunden Verzögerung
        },
        error: function(xhr, status, error) {
            console.error("Fehler beim Senden der Abstimmung:", xhr.responseText);
            alert('Es gab ein Problem bei der Abstimmung: ' + error);
        }
    });
}


function loadAppointmentsToDelete() {
    $.ajax({
        url: '/Appointment-Finder/backend/serviceHandler.php',
        method: 'GET',
        data: {
            method: "getAllAppointments"
        },
        dataType: 'json',
        success: function(appointments) {
            const tableBody = $('#appointmentDelete tbody');
            tableBody.empty();
            appointments.forEach(function(appointment) {
                tableBody.append(`
                    <tr>
                        <td>${appointment.title}</td>
                        <td>${appointment.location}</td>
                        <td><button data-appointment-id="${appointment.appointment_id}" class="btn btn-danger delete-btn">Löschen</button></td>
                    </tr>
                `);
            });
        },
        error: function(xhr, status, error) {
            console.error("Fehler beim Laden der Termine:", xhr.responseText);
            alert('Fehler beim Laden der Termine: ' + error);
        }
    });
}


function deleteAppointment(appointmentId) {
    console.log("Sending appointment_id:", appointmentId); // Überprüfe, ob die ID korrekt ist
    if (confirm('Sind Sie sicher, dass Sie diesen Termin löschen möchten?')) {
        $.ajax({
            url: '/Appointment-Finder/backend/serviceHandler.php',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                method: "deleteAppointment",
                param: { appointment_id: appointmentId }
            }),
            success: function(response) {
                console.log(response);
                if (response.success) {
                    alert('Termin erfolgreich gelöscht.');
                    loadAppointmentsToDelete(); // Liste neu laden
                } else {
                    alert('Fehler beim Löschen des Termins: ' + response.message);
                }
            },
            error: function(xhr, status, error) {
                console.error("Fehler beim Löschen des Termins:", xhr.responseText);
                alert('Fehler beim Löschen des Termins: ' + error);
            }
        });
    }
}


/*
// Diese Funktion lädt alle Termine und zeigt sie in einer Tabelle mit Lösch-Buttons an.
function loadAppointmentsToDelete() {
    $.ajax({
        url: '/Appointment-Finder/backend/serviceHandler.php',
        method: 'GET',
        data: {
            method: "getAllAppointments"
        },
        dataType: 'json',
        success: function(appointments) {
            const tableBody = $('#appointmentDelete tbody');
            tableBody.empty();
            appointments.forEach(function(appointment) {
                tableBody.append(`
                    <tr>
                        <td>${appointment.title}</td>
                        <td>${appointment.location}</td>
                        <td><button onclick="deleteAppointment(${appointment.appointment_id})" class="btn btn-danger">Löschen</button></td>
                    </tr>
                `);
            });
        },
        
        //  error: function(xhr, status, error) {
        //     console.error("Fehler beim Laden der Termine:");
        // //     // alert('Fehler beim Laden der Termine: ' + error);
        // }
    });
}

function deleteAppointment(appointmentId) {
    console.log("Sending appointment_id:", appointmentId); // Überprüfe, ob die ID korrekt ist
    if (confirm('Sind Sie sicher, dass Sie diesen Termin löschen möchten?')) {
        $.ajax({
            url: '/Appointment-Finder/backend/serviceHandler.php',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                method: "deleteAppointment",
                param: { appointment_id: appointmentId }
            }),
            success: function(response) {
                console.log(response);
                if (response.success) {
                    alert('Termin erfolgreich gelöscht.');
                    loadAppointmentsToDelete(); // Liste neu laden
                } else {
                    alert('Fehler beim Löschen des Termins: ' + response.message);
                }
            },
            // error: function(xhr, status, error) {
            //     console.error("Fehler beim Löschen des Termins:", xhr.responseText);
            //     alert('Fehler beim Löschen des Termins: ' + error);
            // }
        });
    }
}
*/
/*
function deleteAppointment(appointmentId) {
    if (confirm('Sind Sie sicher, dass Sie diesen Termin löschen möchten?')) {
        $.ajax({
            url: '/Appointment-Finder/backend/serviceHandler.php',
            method: 'POST',
            contentType: 'application/json', // Stelle sicher, dass der Content-Type auf application/json gesetzt ist
            data: JSON.stringify({
                method: "deleteAppointment",
                param: { appointment_id: appointmentId }
            }),
            success: function(response) {
                alert('Termin erfolgreich gelöscht.');
                loadAppointmentsToDelete(); // Liste neu laden
            },
            error: function(xhr, status, error) {
                console.error("Fehler beim Löschen des Termins:", xhr.responseText);
                alert('Fehler beim Löschen des Termins: ' + error);
            }
        });
    }
}*/





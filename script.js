// ======================================================
// FIREBASE CONFIGURATION
// ======================================================

const firebaseConfig = {
    databaseURL: "https://faculty-assistance-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);

const database = firebase.database();


// ======================================================
// GLOBAL VARIABLES
// ======================================================

let selectedRating = 0;


// ======================================================
// SECTION NAVIGATION
// ======================================================

function showSection(sectionId, menuId) {

    const sections = [
        'dashboard-section',
        'request-form',
        'status-section',
        'my-requests-section',
        'overview-section',
        'feedback-section',
        'faculty-section'
    ];

    const menus = [
        'menu-home',
        'menu-send',
        'menu-my',
        'menu-overview',
        'menu-feedback',
        'menu-faculty-panel'
    ];


    // Hide all sections

    sections.forEach(function(id) {

        const section = document.getElementById(id);

        if (section) {
            section.classList.add('hidden');
        }

    });


    // Remove active from all menu items

    menus.forEach(function(id) {

        const menu = document.getElementById(id);

        if (menu) {
            menu.classList.remove('active');
        }

    });


    // Show selected section

    const selectedSection =
        document.getElementById(sectionId);

    if (selectedSection) {
        selectedSection.classList.remove('hidden');
    }


    // Activate selected menu

    const selectedMenu =
        document.getElementById(menuId);

    if (selectedMenu) {
        selectedMenu.classList.add('active');
    }


    // Refresh overview when opened

    if (sectionId === 'overview-section') {
        updateOverview();
    }

}


// ======================================================
// QUICK ASSISTANCE CATEGORY
// ======================================================

function openRequestWithCategory(cat) {

    showSection(
        'request-form',
        'menu-send'
    );

    const requestType =
        document.getElementById('requestType');

    if (requestType) {
        requestType.value = cat;
    }

}


// ======================================================
// SEND REQUEST TO FIREBASE
// ======================================================

function submitRequestToFirebase() {

    const facultySelect = document.getElementById('facultySelect');
    const requestTypeSelect = document.getElementById('requestType');
    const locationInput = document.getElementById('locationInput');

    const fac = facultySelect ? facultySelect.value : "";
    const typ = requestTypeSelect ? requestTypeSelect.value : "";
    const loc = locationInput ? locationInput.value : "";


    database.ref('liveRequest/').set({

        faculty: fac,

        type: typ,

        location: loc,

        status: "Pending"

    });


    // Open live status page

    showSection(
        'status-section',
        'menu-send'
    );


    // Update overview immediately

    updateOverviewFromData({
        faculty: fac,
        type: typ,
        location: loc,
        status: "Pending"
    });

}


// ======================================================
// FIREBASE REAL-TIME LISTENER
// ======================================================

database.ref('liveRequest/').on('value', (snapshot) => {

    const data = snapshot.val();


    if (data) {

        // ==============================================
        // 1. UPDATE STUDENT LIVE STATUS
        // ==============================================

        const liveStatusText =
            document.getElementById('liveStatusText');

        const statusTitle =
            document.getElementById('status-title');

        const stepFaculty =
            document.getElementById('step-faculty');


        if (liveStatusText) {
            liveStatusText.innerText =
                data.status;
        }


        if (statusTitle && stepFaculty) {
            if (data.status === 'Accepted') {

                statusTitle.innerText =
                    "🎉 Request Accepted Real-Time!";

                statusTitle.style.color =
                    "#2ecc71";

                stepFaculty.className =
                    "step done";

            }

            else if (data.status === 'Rejected') {

                statusTitle.innerText =
                    "❌ Request Rejected / Faculty Busy";

                statusTitle.style.color =
                    "#e74c3c";

                stepFaculty.className =
                    "step";

            }

            else {

                statusTitle.innerText =
                    "⏳ Waiting for Faculty Response...";

                statusTitle.style.color =
                    "#f39c12";

                stepFaculty.className =
                    "step";

            }
        }


        // ==============================================
        // 2. FACULTY REAL-TIME PANEL
        // ==============================================

        const noRequestBox =
            document.getElementById('no-request-box');

        const activeFacultyCard =
            document.getElementById('active-faculty-card');


        if (noRequestBox && activeFacultyCard) {
            if (data.status === 'Pending') {

                noRequestBox.classList.add('hidden');

                activeFacultyCard.classList.remove('hidden');

                const fFac = document.getElementById('f-fac');
                const fType = document.getElementById('f-type');
                const fLoc = document.getElementById('f-loc');

                if (fFac) fFac.innerText = data.faculty;
                if (fType) fType.innerText = data.type;
                if (fLoc) fLoc.innerText = data.location;

            }

            else {

                noRequestBox.classList.remove('hidden');

                activeFacultyCard.classList.add('hidden');

            }
        }


        // ==============================================
        // 3. LIVE REQUEST TABLE
        // ==============================================

        const liveTableBody = document.getElementById('liveTableBody');

        if (liveTableBody) {
            const statusColor =
                data.status === 'Accepted'
                    ? '#2ecc71'
                    : data.status === 'Pending'
                        ? '#f39c12'
                        : '#e74c3c';


            liveTableBody.innerHTML = `

                <tr style="
                    border-bottom:1px solid #f0f4f8;
                    font-size:14px;
                    color:#2c3e50;
                ">

                    <td style="padding:12px;font-weight:500;">
                        ${data.faculty}
                    </td>

                    <td style="padding:12px;">
                        ${data.type}
                    </td>

                    <td style="padding:12px;">
                        ${data.location}
                    </td>

                    <td style="
                        padding:12px;
                        font-weight:bold;
                        color:${statusColor};
                    ">
                        ${data.status}
                    </td>

                </tr>

            `;
        }


        // ==============================================
        // 4. UPDATE OVERVIEW
        // ==============================================

        updateOverviewFromData(data);

    }

});


// ======================================================
// FACULTY ACCEPT / REJECT REQUEST
// ======================================================

function updateLiveStatus(newStatus) {

    database.ref('liveRequest/').update({

        status: newStatus

    });

}


// ======================================================
// OVERVIEW FUNCTION
// ======================================================

function updateOverviewFromData(data) {

    if (!data) return;

    let total = 1;

    let pending = 0;

    let accepted = 0;

    let completed = 0;


    if (data.status === 'Pending') {

        pending = 1;

    }

    else if (data.status === 'Accepted') {

        accepted = 1;

    }

    else if (data.status === 'Completed') {

        completed = 1;

    }


    // Update overview cards

    const totalElement =
        document.getElementById('overview-total');

    const pendingElement =
        document.getElementById('overview-pending');

    const acceptedElement =
        document.getElementById('overview-accepted');

    const completedElement =
        document.getElementById('overview-completed');


    if (totalElement)
        totalElement.innerText = total;

    if (pendingElement)
        pendingElement.innerText = pending;

    if (acceptedElement)
        acceptedElement.innerText = accepted;

    if (completedElement)
        completedElement.innerText = completed;


    // Request type summary

    const project =
        document.getElementById('summary-project');

    const subject =
        document.getElementById('summary-subject');

    const assignment =
        document.getElementById('summary-assignment');

    const career =
        document.getElementById('summary-career');


    if (project)
        project.innerText =
            data.type === 'Project Guidance' ? 1 : 0;

    if (subject)
        subject.innerText =
            data.type === 'Subject Doubt' ? 1 : 0;

    if (assignment)
        assignment.innerText =
            data.type === 'Assignment Help' ? 1 : 0;

    if (career)
        career.innerText =
            data.type === 'Career Guidance' ? 1 : 0;


    // Current status

    const currentStatus =
        document.getElementById('overview-current-status');


    if (currentStatus) {

        currentStatus.innerHTML = `

            <span class="status-badge ${getStatusClass(data.status)}">

                ${getStatusIcon(data.status)}
                ${data.status}

            </span>

            <br><br>

            Faculty: <strong>${data.faculty}</strong>

            <br>

            Request Type: <strong>${data.type}</strong>

            <br>

            Location: <strong>${data.location}</strong>

        `;

    }

}


// ======================================================
// OVERVIEW DEFAULT STATE
// ======================================================

function updateOverview() {

    database.ref('liveRequest/').once('value')
        .then(function(snapshot) {

            const data = snapshot.val();

            if (data) {

                updateOverviewFromData(data);

            }

        });

}


// ======================================================
// STATUS HELPER FUNCTIONS
// ======================================================

function getStatusClass(status) {

    if (status === 'Accepted') {
        return 'status-accepted';
    }

    if (status === 'Rejected') {
        return 'status-rejected';
    }

    return 'status-pending';

}


function getStatusIcon(status) {

    if (status === 'Accepted') {
        return '✅';
    }

    if (status === 'Rejected') {
        return '❌';
    }

    return '⏳';

}


// ======================================================
// FEEDBACK - STAR RATING
// ======================================================

function selectRating(rating) {

    selectedRating = rating;


    const stars =
        document.querySelectorAll('.feedback-star');


    stars.forEach(function(star, index) {

        if (index < rating) {

            star.innerText = '★';

            star.classList.add('selected');

        }

        else {

            star.innerText = '☆';

            star.classList.remove('selected');

        }

    });


    const ratingText =
        document.getElementById('ratingText');


    const messages = {

        1: "😔 Very Poor",

        2: "😕 Poor",

        3: "🙂 Average",

        4: "😊 Good",

        5: "😍 Excellent!"

    };


    if (ratingText) {
        ratingText.innerText = messages[rating];
    }

}


// ======================================================
// SUBMIT FEEDBACK
// ======================================================

function submitFeedback() {

    const messageInput = document.getElementById('feedbackMessage');
    const message = messageInput ? messageInput.value.trim() : "";


    // Check rating

    if (selectedRating === 0) {

        alert("Please select a rating ⭐");

        return;

    }


    // Check message

    if (message === "") {

        alert("Please write your feedback 💬");

        return;

    }


    // Store feedback locally

    const feedbackData = {

        rating: selectedRating,

        message: message,

        date: new Date().toLocaleString()

    };


    localStorage.setItem(
        'facultyFeedback',
        JSON.stringify(feedbackData)
    );


    // Show success message

    const success =
        document.getElementById('feedbackSuccess');

    if (success) {
        success.style.display = 'block';
    }


    // Clear message

    if (messageInput) {
        messageInput.value = "";
    }


    // Reset stars

    selectedRating = 0;


    document.querySelectorAll('.feedback-star')
        .forEach(function(star) {

            star.innerText = '☆';

            star.classList.remove('selected');

        });


    const ratingText = document.getElementById('ratingText');
    if (ratingText) {
        ratingText.innerText = "Please select a rating";
    }


    // Hide success after 4 seconds

    if (success) {
        setTimeout(function() {

            success.style.display =
                'none';

        }, 4000);
    }

}


// ======================================================
// PAGE INITIALIZATION
// ======================================================

document.addEventListener(
    'DOMContentLoaded',
    function() {

        updateOverview();

    }
);
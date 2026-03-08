// --- ส่วนที่ 1: ตั้งค่าส่วนกลาง (ทำงานทุกหน้า) ---
const options = { year: 'numeric', month: 'long', day: 'numeric' };
const today = new Date().toLocaleDateString('th-TH', options);

// --- ส่วนที่ 2: ตัวแบ่งการทำงานตามหน้าเว็บ ---
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split("/").pop();

    if (currentPage === "home_page.html" || currentPage === "" || currentPage === "index.html") {
        initHomePage();
    } else if (currentPage === "history_room.html") {
        initHistoryPage();
    } else if (currentPage === "history_room_3.html") {
        initCanceledPage(); // เพิ่มการเรียกใช้หน้ายกเลิก
    }
});

// --- ส่วนที่ 3: ฟังก์ชันสำหรับหน้าแรก (Home Page) ---
function initHomePage() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) dateElement.innerHTML = today;

    const timeInSelect = document.getElementById('time_in');
    const timeOutSelect = document.getElementById('time_out');

    if (timeInSelect && timeOutSelect) {
        timeOutSelect.disabled = true;

        timeInSelect.addEventListener('change', () => {
            const selectedIndex = timeInSelect.selectedIndex;
            if (selectedIndex === 0) { // กรณีเลือก "กรุณาเลือกเวลา"
                timeOutSelect.selectedIndex = 0;
                return;
            }
            let targetIndex = selectedIndex + 2;
            if (targetIndex >= timeOutSelect.options.length) {
                targetIndex = timeOutSelect.options.length - 1;
            }
            timeOutSelect.selectedIndex = targetIndex;
        });
    }

    // ระบบค้นหาและตัวกรอง (เหมือนเดิม)
    const searchInput = document.getElementById('search');
    const roomTypeSelect = document.getElementById('room_type');
    const floorTypeSelect = document.getElementById('floor_type');
    const roomCards = document.querySelectorAll('#all_room > div');
    const noRoomMessage = document.getElementById('no_room_found');

    function filterRooms() {
        const searchText = searchInput.value.toLowerCase();
        const selectedType = roomTypeSelect.value;
        const selectedFloor = floorTypeSelect.value;
        let visibleCount = 0;

        roomCards.forEach(card => {
            const roomTitle = card.querySelector('h1.text-xl').textContent.toLowerCase();
            const roomDetail = card.querySelector('h1.text-gray-500').textContent.toLowerCase();
            const roomType = card.querySelector('.m-5 h1').textContent.trim();
            
            const matchesSearch = roomTitle.includes(searchText) || roomDetail.includes(searchText);
            const matchesType = (selectedType === 'all') || (roomType === selectedType);
            const matchesFloor = (selectedFloor === 'all') || (roomDetail.includes(selectedFloor.toLowerCase()));

            if (matchesSearch && matchesType && matchesFloor) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        if (noRoomMessage) {
            visibleCount === 0 ? noRoomMessage.classList.remove('hidden') : noRoomMessage.classList.add('hidden');
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterRooms);
        roomTypeSelect.addEventListener('change', filterRooms);
        floorTypeSelect.addEventListener('change', filterRooms);
    }

    const cancelBtn = document.getElementById("cancel");
    const bookModel = document.getElementById("book_model");
    if (cancelBtn) cancelBtn.addEventListener('click', closeModel);
    if (bookModel) {
        bookModel.addEventListener('click', (e) => {
            if (e.target === bookModel) closeModel();
        });
    }
}

// --- ส่วนที่ 4: ฟังก์ชันสำหรับหน้าการจอง (กำลังจอง) ---
function initHistoryPage() {
    const bookingListContainer = document.getElementById('booking-container');
    const bookings = JSON.parse(localStorage.getItem('myBookings')) || [];
    const activeBookings = bookings.filter(b => b.status === "กำลังจอง");

    if (activeBookings.length > 0 && bookingListContainer) {
        bookingListContainer.innerHTML = '<div id="booking-grid" class="flex flex-col gap-4 w-full p-4"></div>';
        bookingListContainer.classList.remove('justify-center', 'items-center', 'h-48');
        
        const grid = document.getElementById('booking-grid');

        activeBookings.forEach(item => {
            grid.innerHTML += `
                <div class="border rounded-2xl p-5 shadow-sm flex justify-between items-center bg-white border-l-8 border-l-purple-800 text-left font-sans">
                    <div class="flex gap-4">
                        <div class="bg-gray-100 p-3 rounded-xl flex items-center justify-center w-16 h-16">
                             <i class="bx bx-door-open text-3xl text-purple-800"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-lg text-black text-left">ห้องหมายเลข ${item.roomNumber} (ชั้น ${item.floor})</h3>
                            <p class="text-gray-500 text-sm text-left italic">วัตถุประสงค์: ${item.objective}</p>
                            <div class="flex gap-3 mt-2 font-medium">
                                <span class="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">📅 ${item.date}</span>
                                <span class="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">⏰ ${item.timeIn} - ${item.timeOut} น.</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col items-end gap-2">
                        <span class="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                            ${item.status}
                        </span>
                        <button onclick="cancelBooking(${item.id})" class="text-red-500 text-sm hover:underline mt-2">ยกเลิกการจอง</button>
                    </div>
                </div>`;
        });
    }
}

// --- ส่วนที่เพิ่ม: ฟังก์ชันสำหรับหน้าประวัติที่ถูกยกเลิก (history_room_3.html) ---
function initCanceledPage() {
    const container = document.getElementById('canceled-booking-container');
    const bookings = JSON.parse(localStorage.getItem('myBookings')) || [];
    
    // กรองเอาเฉพาะสถานะ "ยกเลิกแล้ว"
    const canceledBookings = bookings.filter(b => b.status === "ยกเลิกแล้ว");

    if (canceledBookings.length > 0 && container) {
        container.innerHTML = '<div class="flex flex-col gap-4 w-full p-4"></div>';
        const grid = container.firstChild;
        container.classList.remove('justify-center', 'items-center', 'h-48');

        canceledBookings.forEach(item => {
            grid.innerHTML += `
                <div class="border rounded-2xl p-5 shadow-sm flex justify-between items-center bg-red-50 border-l-8 border-l-red-500 opacity-80 text-left font-sans">
                    <div class="flex gap-4">
                        <div class="bg-red-100 p-3 rounded-xl flex items-center justify-center w-16 h-16">
                             <i class="bx bx-x-circle text-3xl text-red-600"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-lg text-gray-800">ห้องหมายเลข ${item.roomNumber} (ชั้น ${item.floor})</h3>
                            <p class="text-gray-500 text-sm italic">สถานะ: ยกเลิกโดยผู้ใช้งาน</p>
                            <div class="flex gap-3 mt-2 font-medium">
                                <span class="text-xs bg-red-100 px-2 py-1 rounded text-red-600">${item.date}</span>
                                <span class="text-xs bg-red-100 px-2 py-1 rounded text-red-600">${item.timeIn} - ${item.timeOut} น.</span>
                            </div>
                        </div>
                    </div>
                    <span class="bg-red-200 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase">ยกเลิกแล้ว</span>
                </div>`;
        });
    }
}

// --- ส่วนที่ 5: ฟังก์ชัน Global ---

function autoFill(button) {
    const bookModel = document.getElementById("book_model");
    const roomNumber = button.dataset.room;
    
    document.getElementById("floor_data").innerText = button.dataset.floor;
    document.getElementById("room_data").innerText = roomNumber;
    document.getElementById("store_data").innerText = button.dataset.store;
    document.getElementById("amenities_data").innerText = button.dataset.amenities;

    const bookings = JSON.parse(localStorage.getItem('myBookings')) || [];
    const timeInSelect = document.getElementById('time_in');
    const timeOutSelect = document.getElementById('time_out');

    // รีเซ็ตค่าเป็น "กรุณา..."
    if (timeInSelect) timeInSelect.selectedIndex = 0;
    if (timeOutSelect) timeOutSelect.selectedIndex = 0;

    Array.from(timeInSelect.options).forEach(opt => {
        opt.disabled = false;
        opt.classList.remove('bg-gray-200', 'text-gray-400');
    });

    const roomBookings = bookings.filter(b => b.roomNumber === roomNumber && b.status === "กำลังจอง");

    roomBookings.forEach(booking => {
        const start = parseInt(booking.timeIn.split(':')[0]);
        const end = parseInt(booking.timeOut.split(':')[0]);

        Array.from(timeInSelect.options).forEach(option => {
            const currentHour = parseInt(option.text.split(':')[0]);
            if (currentHour >= start && currentHour < end) {
                option.disabled = true;
                option.classList.add('bg-gray-200', 'text-gray-400');
            }
        });
    });

    bookModel.classList.remove("hidden");
    bookModel.classList.add("flex");
    document.body.style.overflow = "hidden";
}

function closeModel() {
    const bookModel = document.getElementById("book_model");
    const timeInSelect = document.getElementById('time_in');
    const timeOutSelect = document.getElementById('time_out');
    const objectiveInput = document.getElementById('objective');

    if (timeInSelect) timeInSelect.selectedIndex = 0;
    if (timeOutSelect) timeOutSelect.selectedIndex = 0;
    if (objectiveInput) objectiveInput.value = "";

    bookModel.classList.replace("flex", "hidden");
    document.body.style.overflow = "auto";
}

function confirmBooking(event) {
    if (event) event.preventDefault();
    
    const timeInEl = document.getElementById('time_in');
    const timeOutEl = document.getElementById('time_out');
    const objectiveEl = document.getElementById('objective');

    if (timeInEl.selectedIndex === 0) {
        alert("กรุณาเลือกเวลาเข้าก่อนทำการจอง");
        return;
    }

    const bookingData = {
        id: Date.now(),
        roomNumber: document.getElementById('room_data').innerText,
        floor: document.getElementById('floor_data').innerText,
        capacity: document.getElementById('store_data').innerText,
        amenities: document.getElementById('amenities_data').innerText,
        date: document.getElementById('current-date').innerText,
        timeIn: timeInEl.options[timeInEl.selectedIndex].text,
        timeOut: timeOutEl.options[timeOutEl.selectedIndex].text,
        objective: objectiveEl.value || "ไม่ได้ระบุ",
        status: "กำลังจอง"
    };

    let myBookings = JSON.parse(localStorage.getItem('myBookings')) || [];
    myBookings.push(bookingData);
    localStorage.setItem('myBookings', JSON.stringify(myBookings));

    alert("จองสำเร็จเรียบร้อยแล้ว!");
    window.location.href = '/useser/history/history_room.html';
}

// แก้ไขฟังก์ชันยกเลิก: ให้เปลี่ยนสถานะแทนการลบ
function cancelBooking(id) {
    if(confirm('คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?')) {
        let bookings = JSON.parse(localStorage.getItem('myBookings')) || [];
        const index = bookings.findIndex(b => b.id === id);
        
        if (index !== -1) {
            bookings[index].status = "ยกเลิกแล้ว"; // เปลี่ยนสถานะ
            localStorage.setItem('myBookings', JSON.stringify(bookings));
            alert("ยกเลิกการจองแล้ว ข้อมูลถูกย้ายไปที่หน้า 'ยกเลิก'");
            location.reload();
        }
    }
}
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './index.css';
import './App.css';

const API_URL = 'http://localhost:3000';

const ADMIN_EMAIL = 'fatima@test.com';
const ADMIN_PASS = 'Password123!';

const ROOM_PRICES = {
  'Standart Oda': 2500,
  'Deluxe King Süit': 4500,
  'Executive Süit': 6800,
  'Presidential Süit': 12000,
};

const ROOM_FEATURES = {
  'Standart Oda': {
    badge: 'Bahçe Manzaralı • 32 m²',
    desc: 'Huzurlu bahçe manzarası, ortopedik King Bed, ergonomik çalışma masası ve yağmur duşlu ferah banyo.',
    board: '☕ Sadece Açık Büfe Sabah Kahvaltısı Dahil',
  },
  'Deluxe King Süit': {
    badge: 'Kısmi Deniz Manzaralı • 55 m²',
    desc: 'Akdeniz esintili balkon, dinlenme köşesi, Super King yatak, lüks mermer banyo ve çift kişilik jakuzi.',
    board: '☕ Sadece Açık Büfe Sabah Kahvaltısı Dahil',
  },
  'Executive Süit': {
    badge: 'Tam Panoramik Deniz • 80 m²',
    desc: 'Geniş oturma odası, giyinme odası, Nespresso barı ve özel teras alanı ile premium konfor.',
    board: '☕ Sadece Açık Büfe Sabah Kahvaltısı Dahil',
  },
  'Presidential Süit': {
    badge: 'Penthouse Teras • 160 m²',
    desc: 'Teras jakuzisi, özel yemek ve toplantı salonu, şömine, master süit yatak odası ve 24 saat VIP butler.',
    board: '☕ Sadece Gurme Açık Büfe Sabah Kahvaltısı Dahil',
  },
};

const ROOM_IMAGES = {
  'Standart Oda': 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=85',
  'Deluxe King Süit': 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=85',
  'Executive Süit': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=85',
  'Presidential Süit': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=85',
};

const generateHotelRooms = () => {
  const rooms = [];
  for (let i = 101; i <= 250; i++) {
    const floor = i <= 175 ? '1. Kat' : '2. Kat';
    rooms.push({ no: String(i), floor, type: 'Standart Oda', capacity: '2 Kişilik', bed: i % 2 === 0 ? 'Twin Bed' : 'King Bed' });
  }
  for (let i = 251; i <= 350; i++) {
    const floor = i <= 300 ? '3. Kat' : '4. Kat';
    rooms.push({ no: String(i), floor, type: 'Deluxe King Süit', capacity: '2+1 Kişilik', bed: 'Super King Bed' });
  }
  for (let i = 351; i <= 390; i++) {
    rooms.push({ no: String(i), floor: '5. Kat (Executive)', type: 'Executive Süit', capacity: '3 Kişilik', bed: 'King Bed + Dinlenme Alanı' });
  }
  for (let i = 391; i <= 400; i++) {
    rooms.push({ no: String(i), floor: 'Penthouse (6. Kat)', type: 'Presidential Süit', capacity: '4 Kişilik', bed: 'Panoramik Master Süit' });
  }
  return rooms;
};

const HOTEL_ROOMS = generateHotelRooms();

const INITIAL_REVIEWS = [
  { id: 1, guest: 'Ahmet Yılmaz', room: 'Presidential Süit', rating: 5, date: '12 Ekim 2026', comment: 'Manzara ve sabah kahvaltısı harikaydı, Artemis kalitesi her detayda hissediliyor.' },
  { id: 2, guest: 'Selin Demir', room: 'Deluxe King Süit', rating: 5, date: '10 Ekim 2026', comment: 'Artemis web sitesi üzerinden rezervasyon yaptım, odanın jakuzisi ve kahvaltısı kusursuzdu.' },
  { id: 3, guest: 'Can Polat', room: 'Executive Süit', rating: 4, date: '08 Ekim 2026', comment: 'Geniş teras ve taze açık büfe kahvaltı servisi mükemmeldi.' },
];

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'guest');
  const [loggedUserEmail, setLoggedUserEmail] = useState(localStorage.getItem('loggedUserEmail') || '');
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [adminUsernameInput, setAdminUsernameInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');

  const [activeMenu, setActiveMenu] = useState('Rezervasyonlar');
  const [reservations, setReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [roomFilter, setRoomFilter] = useState('Tümü');
  const [sourceFilter, setSourceFilter] = useState('Tümü');
  const [statusFilter, setStatusFilter] = useState('Tümü');

  
  const [roomTypeFilterTab, setRoomTypeFilterTab] = useState('Tümü');
  const [roomStatusFilterTab, setRoomStatusFilterTab] = useState('Tümü');
  const [roomSearchInput, setRoomSearchInput] = useState('');
  const [roomPage, setRoomPage] = useState(1);
  const roomsPerPage = 12;

  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [newReviewGuest, setNewReviewGuest] = useState('');
  const [newReviewRoom, setNewReviewRoom] = useState('Deluxe King Süit');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  
  const [guestName, setGuestName] = useState('');
  const [guestEmailInput, setGuestEmailInput] = useState('');
  const [roomType, setRoomType] = useState('Deluxe King Süit');
  const [roomNumber, setRoomNumber] = useState('251');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [bookingSource, setBookingSource] = useState('Artemis Doğrudan Web');
  const [paymentMethod, setPaymentMethod] = useState('Kredi Kartı ile Güvenli Ödeme');
  const [paymentStatus, setPaymentStatus] = useState('Ödendi');

  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const todayStr = useMemo(() => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const calculateTotal = (rType, inDate, outDate) => {
    if (!inDate || !outDate) return ROOM_PRICES[rType] || 2500;
    const s = new Date(inDate);
    const e = new Date(outDate);
    const diff = Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24));
    const nights = diff > 0 ? diff : 1;
    return (ROOM_PRICES[rType] || 2500) * nights;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    if (userRole === 'guest' && cleanEmail === ADMIN_EMAIL) {
      setError('Kullanıcı adı veya şifre hatalı!');
      return;
    }

    if (userRole === 'admin') {
      if (cleanEmail !== ADMIN_EMAIL || password !== ADMIN_PASS) {
        setError('Kullanıcı adı veya şifre hatalı!');
        return;
      }
    }

    setLoading(true);
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? { email, password, name } : { email, password };
      const res = await axios.post(`${API_URL}${endpoint}`, payload);

      const jwtToken = res.data.accessToken;
      setToken(jwtToken);
      setLoggedUserEmail(cleanEmail);
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('userRole', userRole);
      localStorage.setItem('loggedUserEmail', cleanEmail);
      showToast(userRole === 'admin' ? 'Yönetici paneline giriş yapıldı.' : 'Artemis Misafir Portalına hoş geldiniz!');
    } catch (err) {
      setError('Kullanıcı adı veya şifre hatalı!');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAdminSwitch = (e) => {
    e.preventDefault();
    setAdminAuthError('');
    if (adminUsernameInput.trim().toLowerCase() === ADMIN_EMAIL && adminPasswordInput === ADMIN_PASS) {
      setUserRole('admin');
      localStorage.setItem('userRole', 'admin');
      setIsAdminAuthModalOpen(false);
      setAdminUsernameInput('');
      setAdminPasswordInput('');
      showToast('Yönetici yetkisi onaylandı. Panele geçiş yapıldı.');
    } else {
      setAdminAuthError('Kullanıcı adı veya şifre hatalı!');
    }
  };

  const handleLogout = () => {
    setToken('');
    setUserRole('guest');
    setLoggedUserEmail('');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('loggedUserEmail');
    setReservations([]);
  };

  const fetchReservations = async () => {
    try {
      const res = await axios.get(`${API_URL}/reservations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dbList = Array.isArray(res.data) ? res.data : [];
      const localStore = JSON.parse(localStorage.getItem('artemis_global_reservations') || '[]');
      const combined = [...dbList];

      localStore.forEach((loc) => {
        if (!combined.some((c) => String(c.id) === String(loc.id))) {
          combined.push(loc);
        }
      });

      setReservations(combined);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      const localStore = JSON.parse(localStorage.getItem('artemis_global_reservations') || '[]');
      setReservations(localStore);
    }
  };

  useEffect(() => {
    if (token) fetchReservations();
  }, [token]);

  
  const handleCreateReservation = async (e) => {
    e.preventDefault();
    try {
      if (checkInDate < todayStr) {
        alert('Geçmiş bir tarihe rezervasyon yapılamaz!');
        return;
      }
      if (checkOutDate <= checkInDate) {
        alert('Çıkış tarihi giriş tarihinden sonraki bir gün olmalıdır!');
        return;
      }

     
      const isCardPayment = paymentMethod === 'Kredi Kartı ile Güvenli Ödeme' || paymentMethod === 'Banka Kartı';
      if (isCardPayment && (!cardHolder || !cardNumber || !cardExpiry || !cardCvv)) {
        alert('Lütfen kart bilgilerinizi eksiksiz doldurunuz!');
        return;
      }

      let assignedRoomNumber = roomNumber;
      if (userRole === 'guest') {
        const candidateRooms = HOTEL_ROOMS.filter((r) => r.type === roomType);
        const freeRoom = candidateRooms.find((r) => {
          return !parsedList.some((res) => (res.roomNumber === r.no || res.roomNumber.includes(r.no)) && res.isCurrentlyInHotel);
        });
        assignedRoomNumber = freeRoom ? freeRoom.no : candidateRooms[0].no;
      }

      const computedPrice = calculateTotal(roomType, checkInDate, checkOutDate);
      const emailToSave = userRole === 'guest' ? (loggedUserEmail || 'misafir@artemis.com') : (guestEmailInput || 'resepsiyon@artemis.com');
      const channelToSave = userRole === 'guest' ? 'Artemis Doğrudan Web' : bookingSource;

      
      const methodLabel = isCardPayment 
        ? `${paymentMethod} (Kart Sonu: ${cardNumber.replace(/\s+/g, '').slice(-4) || '****'})` 
        : paymentMethod;

      const titlePayload = `${guestName} • ${roomType} • No:${assignedRoomNumber} • ${channelToSave} • ${paymentStatus} • ${methodLabel} • ${computedPrice}₺ • Aktif • Mail:${emailToSave}`;

      let createdItem = null;
      try {
        const res = await axios.post(
          `${API_URL}/reservations`,
          {
            title: titlePayload,
            startDate: new Date(checkInDate).toISOString(),
            endDate: new Date(checkOutDate).toISOString(),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        createdItem = res.data;
      } catch (postErr) {
        createdItem = {
          id: 'LOCAL-' + Date.now(),
          title: titlePayload,
          startDate: new Date(checkInDate).toISOString(),
          endDate: new Date(checkOutDate).toISOString(),
        };
      }

      const localStore = JSON.parse(localStorage.getItem('artemis_global_reservations') || '[]');
      if (createdItem) {
        localStore.unshift(createdItem);
        localStorage.setItem('artemis_global_reservations', JSON.stringify(localStore));
      }

      setGuestName('');
      setGuestEmailInput('');
      setCheckInDate('');
      setCheckOutDate('');
      setCardHolder('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setIsModalOpen(false);
      showToast(`Rezervasyon onaylandı ve sabah kahvaltısı dahil olarak işlendi!`);
      fetchReservations();
    } catch (err) {
      alert('Tarih veya alanları kontrol ediniz.');
    }
  };

  const handleCancelReservation = async (item) => {
    if (!window.confirm(`Rezervasyonu 'Misafir İptal Etti' olarak işaretlemek istiyor musunuz?`)) return;
    try {
      const updatedTitle = `${item.guestName} • ${item.roomType} • No:${item.roomNumber} • ${item.bookingSource} • İade/İptal • ${item.paymentMethod} • 0₺ • Misafir İptal Etti • Mail:${item.guestEmail}`;
      try {
        await axios.patch(
          `${API_URL}/reservations/${item.id}`,
          { title: updatedTitle },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (pErr) {}

      const localStore = JSON.parse(localStorage.getItem('artemis_global_reservations') || '[]');
      const updatedStore = localStore.map((loc) => {
        if (String(loc.id) === String(item.id)) {
          return { ...loc, title: updatedTitle };
        }
        return loc;
      });
      localStorage.setItem('artemis_global_reservations', JSON.stringify(updatedStore));

      showToast(`Rezervasyon iptal edildi, oda boşa çıkarıldı.`);
      fetchReservations();
    } catch (err) {
      alert('İptal işlemi gerçekleştirilemedi!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu rezervasyon kaydını silmek istediğinize emin misiniz?')) return;
    try {
      try {
        await axios.delete(`${API_URL}/reservations/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (dErr) {}

      const localStore = JSON.parse(localStorage.getItem('artemis_global_reservations') || '[]');
      const filteredStore = localStore.filter((loc) => String(loc.id) !== String(id));
      localStorage.setItem('artemis_global_reservations', JSON.stringify(filteredStore));

      showToast('Kayıt silindi.');
      fetchReservations();
    } catch (err) {
      alert('Silinemedi!');
    }
  };

  const parseReservation = (item) => {
    const rawTitle = item?.title || 'Misafir';
    const parts = rawTitle.includes('•') ? rawTitle.split('•').map((p) => p.trim()) : [rawTitle];

    const gName = parts[0] || 'Misafir';
    const rType = parts[1] || 'Standart Oda';
    const rNo = (parts[2] || 'No:101').replace('No:', '').trim();
    const bSrc = parts[3] || 'Artemis Doğrudan Web';
    const pStat = parts[4] || 'Ödendi';
    const pMethod = parts[5] || 'Kredi Kartı';
    const pAmount = parts[6] || `${ROOM_PRICES[rType] || 2500}₺`;
    const cancellationFlag = parts[7] || '';
    const emailPart = parts.find((p) => p.startsWith('Mail:'));
    const gEmail = emailPart ? emailPart.replace('Mail:', '').trim() : 'bilgi@artemis.com';

    const sDate = item?.startDate ? new Date(item.startDate) : new Date();
    const eDate = item?.endDate ? new Date(item.endDate) : new Date();
    const now = new Date();

    const diffTime = Math.abs(eDate - sDate);
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const cleanId = String(item?.id || '').slice(-5).toUpperCase() || '10245';

    const isCancelled = cancellationFlag.includes('İptal') || rawTitle.includes('Misafir İptal Etti');
    const isCompletedStay = !isCancelled && now > eDate;

    let occupancyStatus = 'Gelecek Rezervasyon';
    let statusBadgeColor = '#2563eb';
    let statusBgColor = '#eff6ff';

    if (isCancelled) {
      occupancyStatus = 'Misafir İptal Etti';
      statusBadgeColor = '#dc2626';
      statusBgColor = '#fef2f2';
    } else if (sDate > now) {
      occupancyStatus = 'Gelecekte Kalacak';
      statusBadgeColor = '#2563eb';
      statusBgColor = '#eff6ff';
    } else if (now >= sDate && now <= eDate) {
      occupancyStatus = 'Şu Anda Kalıyor';
      statusBadgeColor = '#059669';
      statusBgColor = '#ecfdf5';
    } else {
      occupancyStatus = 'Geçmişte Kaldı (Çıkış Yapıldı)';
      statusBadgeColor = '#64748b';
      statusBgColor = '#f1f5f9';
    }

    return {
      id: item?.id || Math.random().toString(),
      code: `ART-${cleanId}`,
      guestName: gName,
      guestEmail: gEmail,
      roomType: rType,
      roomNumber: rNo,
      roomImage: ROOM_IMAGES[rType] || ROOM_IMAGES['Standart Oda'],
      bookingSource: bSrc,
      paymentStatus: pStat,
      paymentMethod: pMethod,
      amount: pAmount,
      rawAmount: isCancelled ? 0 : parseInt(pAmount.replace(/[^0-9]/g, '')) || 2500,
      nights: diffDays,
      startDate: sDate,
      endDate: eDate,
      occupancyStatus,
      statusBadgeColor,
      statusBgColor,
      isCancelled,
      isCompletedStay,
      isCurrentlyInHotel: !isCancelled && now >= sDate && now <= eDate,
    };
  };

  const parsedList = (reservations || []).map(parseReservation);

  const guestVisibleList = useMemo(() => {
    if (userRole === 'admin') return parsedList;
    return parsedList.filter((r) => r.guestEmail === loggedUserEmail || r.guestName.toLowerCase().includes(loggedUserEmail.split('@')[0]));
  }, [parsedList, userRole, loggedUserEmail]);

  const hasEligibleCompletedStay = useMemo(() => {
    if (userRole === 'admin') return true;
    return guestVisibleList.some((r) => r.isCompletedStay);
  }, [guestVisibleList, userRole]);

  const guestVisitCounts = useMemo(() => {
    const counts = {};
    parsedList.forEach((r) => {
      const normalizedName = r.guestName.trim().toLowerCase();
      counts[normalizedName] = (counts[normalizedName] || 0) + 1;
    });
    return counts;
  }, [parsedList]);

  const getLoyaltyBadge = (guestNameStr) => {
    const count = guestVisitCounts[guestNameStr.trim().toLowerCase()] || 1;
    if (count === 1) {
      return { text: 'Yeni Müşteri', color: '#047857', bg: '#ecfdf5' };
    } else if (count >= 2 && count <= 3) {
      return { text: `Eski Müşteri (${count}. Geliş)`, color: '#1d4ed8', bg: '#eff6ff' };
    } else {
      return { text: `★ Daimi Müşteri (${count}+ Geliş)`, color: '#b45309', bg: '#fef3c7' };
    }
  };

  const filteredList = parsedList
    .filter((item) => {
      const matchesSearch =
        item.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.roomType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.bookingSource.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRoom = roomFilter === 'Tümü' || item.roomType.includes(roomFilter);
      const matchesSource = sourceFilter === 'Tümü' || item.bookingSource === sourceFilter;

      let matchesStatus = true;
      if (statusFilter === 'İptal') matchesStatus = item.isCancelled;
      else if (statusFilter === 'Aktif') matchesStatus = item.isCurrentlyInHotel;
      else if (statusFilter === 'Gelecek') matchesStatus = !item.isCancelled && item.startDate > new Date();

      return matchesSearch && matchesRoom && matchesSource && matchesStatus;
    })
    .sort((a, b) => (sortOrder === 'newest' ? b.startDate - a.startDate : a.startDate - b.startDate));

  const collectedRevenue = parsedList
    .filter((r) => !r.isCancelled && r.paymentStatus === 'Ödendi')
    .reduce((acc, curr) => acc + curr.rawAmount, 0);

  const pendingRevenue = parsedList
    .filter((r) => !r.isCancelled && r.paymentStatus !== 'Ödendi')
    .reduce((acc, curr) => acc + curr.rawAmount, 0);

  const totalVaultBalance = collectedRevenue;
  const currentlyStayingCount = parsedList.filter((r) => r.isCurrentlyInHotel).length;
  const totalCancelledCount = parsedList.filter((r) => r.isCancelled).length;

  
  const filteredHotelRooms = useMemo(() => {
    return HOTEL_ROOMS.filter((room) => {
      const activeRes = parsedList.find((r) => (r.roomNumber === room.no || r.roomNumber.includes(room.no)) && r.isCurrentlyInHotel);
      const isOccupied = !!activeRes;

      const matchType = roomTypeFilterTab === 'Tümü' || room.type === roomTypeFilterTab;
      const matchStatus =
        roomStatusFilterTab === 'Tümü' ||
        (roomStatusFilterTab === 'Dolu' && isOccupied) ||
        (roomStatusFilterTab === 'Müsait' && !isOccupied);

      const matchSearch =
        room.no.includes(roomSearchInput) ||
        room.type.toLowerCase().includes(roomSearchInput.toLowerCase()) ||
        (activeRes && activeRes.guestName.toLowerCase().includes(roomSearchInput.toLowerCase()));

      return matchType && matchStatus && matchSearch;
    });
  }, [parsedList, roomTypeFilterTab, roomStatusFilterTab, roomSearchInput]);

  const totalPages = Math.ceil(filteredHotelRooms.length / roomsPerPage);
  const paginatedRooms = useMemo(() => {
    const start = (roomPage - 1) * roomsPerPage;
    return filteredHotelRooms.slice(start, start + roomsPerPage);
  }, [filteredHotelRooms, roomPage]);

  const availableRoomNumbersForType = useMemo(() => {
    return HOTEL_ROOMS.filter((r) => r.type === roomType);
  }, [roomType]);

  
  if (!token) {
    return (
      <div style={authStyles.wrapper}>
        <div style={authStyles.card}>
          <div style={authStyles.brand}>A R T E M İ S</div>
          <p style={authStyles.desc}>Hotels & Luxury Resort • Antalya</p>

          <div style={authStyles.roleSelector}>
            <button
              type="button"
              onClick={() => { setUserRole('guest'); setError(''); }}
              style={{
                ...authStyles.roleBtn,
                ...(userRole === 'guest' ? authStyles.roleBtnActive : {}),
              }}
            >
              👤 Misafir Girişi
            </button>
            <button
              type="button"
              onClick={() => { setUserRole('admin'); setError(''); }}
              style={{
                ...authStyles.roleBtn,
                ...(userRole === 'admin' ? authStyles.roleBtnActive : {}),
              }}
            >
              🏨 Yönetici Girişi
            </button>
          </div>

          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
            {userRole === 'guest'
              ? 'Rezervasyon oluşturmak ve konaklamanızı takip etmek için giriş yapın.'
              : 'Yönetici paneline yalnızca yetkili yönetici erişebilir.'}
          </div>

          {error && <div style={authStyles.error}>{error}</div>}

          <form onSubmit={handleAuth} style={authStyles.form}>
            {isRegister && (
              <input
                type="text"
                placeholder="Ad Soyad"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={authStyles.input}
              />
            )}
            <input
              type="email"
              placeholder={userRole === 'admin' ? 'Yönetici E-posta Adresi' : 'E-posta Adresi'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={authStyles.input}
            />
            <input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={authStyles.input}
            />
            <button type="submit" disabled={loading} style={authStyles.btn}>
              {loading ? 'Lütfen bekleyin...' : isRegister ? 'Hesap Oluştur' : (userRole === 'guest' ? 'Misafir Olarak Giriş Yap' : 'Yönetici Olarak Giriş Yap')}
            </button>
          </form>

          {userRole === 'guest' && (
            <div style={authStyles.switchText}>
              {isRegister ? 'Hesabınız var mı? ' : 'Hesabınız yok mu? '}
              <span onClick={() => setIsRegister(!isRegister)} style={authStyles.switchLink}>
                {isRegister ? 'Giriş Yap' : 'Kayıt Ol'}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  
  if (userRole === 'guest') {
    const isCardSelected = paymentMethod === 'Kredi Kartı ile Güvenli Ödeme' || paymentMethod === 'Banka Kartı';

    return (
      <div style={guestStyles.page}>
        {toast && <div style={styles.toast}>{toast}</div>}

        <header style={guestStyles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={guestStyles.brandTitle}>A R T E M İ S</div>
            <span style={{ fontSize: '11px', color: '#64748b', borderLeft: '1px solid #cbd5e1', paddingLeft: '10px' }}>
              Misafir Hizmetleri Portalı ({loggedUserEmail})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => {
                setAdminAuthError('');
                setAdminUsernameInput('');
                setAdminPasswordInput('');
                setIsAdminAuthModalOpen(true);
              }}
              style={guestStyles.switchRoleBtn}
            >
              🔒 Yönetici Paneline Geç
            </button>
            <button onClick={handleLogout} style={guestStyles.logoutBtn}>
              Çıkış Yap
            </button>
          </div>
        </header>

        {}
        <section style={guestStyles.heroBanner}>
          <h1 style={{ fontSize: '32px', fontFamily: 'serif', margin: '0 0 8px 0', color: '#ffffff' }}>
            Artemis Luxury Resort Antalya'ya Hoş Geldiniz
          </h1>
          <p style={{ fontSize: '14px', color: '#e2e8f0', margin: '0 0 16px 0', maxWidth: '650px' }}>
            Akdeniz'in eşsiz doğasında lüks ve konfor. Tüm konaklamalarımızda zengin açık büfe sabah kahvaltısı fiyata dahildir.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.12)', padding: '6px 14px', borderRadius: '20px', color: '#fef08a', fontSize: '12px', fontWeight: '600', marginBottom: '22px' }}>
            ✨ Konsept: Oda & Sadece Açık Büfe Sabah Kahvaltısı (Bed & Breakfast)
          </div>
          <div>
            <button
              onClick={() => {
                setGuestName('');
                setRoomType('Deluxe King Süit');
                setIsModalOpen(true);
              }}
              style={guestStyles.heroCtaBtn}
            >
              + Hemen Rezervasyon Yap
            </button>
          </div>
        </section>

        {}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 20px 10px 20px' }}>
          <h2 style={{ fontFamily: 'serif', fontSize: '22px', margin: '0 0 8px 0', color: '#002B49' }}>
            Artemis Otel İmkanları & Sunduğumuz Hizmetler
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>
            Tatiliniz boyunca konforunuz için tesisimizde sunulan ayrıcalıklar:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px', marginBottom: '36px' }}>
            <div style={guestStyles.amenityBox}>
              <span style={{ fontSize: '26px' }}>🥐</span>
              <strong style={{ fontSize: '13px', color: '#002B49' }}>Sabah Kahvaltısı</strong>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Tüm odalarda açık büfe ücretsiz</span>
            </div>
            <div style={guestStyles.amenityBox}>
              <span style={{ fontSize: '26px' }}>🏖️</span>
              <strong style={{ fontSize: '13px', color: '#002B49' }}>Özel Plaj & İskele</strong>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Mavi bayraklı sahil ve şezlong</span>
            </div>
            <div style={guestStyles.amenityBox}>
              <span style={{ fontSize: '26px' }}>🏊</span>
              <strong style={{ fontSize: '13px', color: '#002B49' }}>Sonsuzluk Havuzu</strong>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Açık & kapalı ısıtmalı havuzlar</span>
            </div>
            <div style={guestStyles.amenityBox}>
              <span style={{ fontSize: '26px' }}>🧖</span>
              <strong style={{ fontSize: '13px', color: '#002B49' }}>SPA & Türk Hamamı</strong>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Sauna, masaj ve dinlenme alanları</span>
            </div>
            <div style={guestStyles.amenityBox}>
              <span style={{ fontSize: '26px' }}>🏋️</span>
              <strong style={{ fontSize: '13px', color: '#002B49' }}>Fitness Center</strong>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Profesyonel spor ekipmanları</span>
            </div>
            <div style={guestStyles.amenityBox}>
              <span style={{ fontSize: '26px' }}>📶</span>
              <strong style={{ fontSize: '13px', color: '#002B49' }}>Ultra Hızlı Wi-Fi</strong>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Otel genelinde kesintisiz internet</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 20px 36px 20px' }}>
          {}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontFamily: 'serif', fontSize: '22px', margin: 0, color: '#002B49' }}>
                  Rezervasyonlarım
                </h2>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  {loggedUserEmail} hesabına kayıtlı konaklama durumlarınız
                </span>
              </div>
              <button
                onClick={() => {
                  setGuestName('');
                  setRoomType('Standart Oda');
                  setIsModalOpen(true);
                }}
                style={styles.btnDark}
              >
                + Yeni Oda Rezerve Et
              </button>
            </div>

            {guestVisibleList.length === 0 ? (
              <div style={guestStyles.emptyBox}>
                Henüz aktif bir rezervasyonunuz bulunmuyor. Yukarıdaki <strong>"+ Hemen Rezervasyon Yap"</strong> butonuna tıklayarak veya aşağıdaki birbirinden farklı süitlerimizden dilediğinizi seçerek rezervasyon yapabilirsiniz.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {guestVisibleList.map((res) => (
                  <div key={res.id} style={guestStyles.reservationCard}>
                    <img src={res.roomImage} alt={res.roomType} style={guestStyles.reservationImg} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontWeight: '800', fontSize: '16px', color: '#002B49' }}>{res.roomType}</span>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '700',
                              backgroundColor: res.statusBgColor,
                              color: res.statusBadgeColor,
                            }}
                          >
                            ● {res.occupancyStatus}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          Tahsis Edilen Oda: <strong>{res.roomNumber}</strong> • {res.nights} Gece
                        </div>
                        <div style={{ fontSize: '12px', color: '#166534', fontWeight: '600', marginTop: '4px' }}>
                          ☕ Sabah Kahvaltısı Dahil
                        </div>
                        <div style={{ fontSize: '12px', color: '#334155', marginTop: '4px' }}>
                          📅 {res.startDate.toLocaleDateString('tr-TR')} - {res.endDate.toLocaleDateString('tr-TR')}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#002B49', marginTop: '4px' }}>
                          Toplam: {res.amount}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                        {!res.isCancelled && (
                          <button
                            onClick={() => handleCancelReservation(res)}
                            style={guestStyles.cancelBtn}
                          >
                            Rezervasyonu İptal Et
                          </button>
                        )}
                        <button onClick={() => setSelectedDetail(res)} style={styles.viewBtn}>
                          Detayları Gör
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontFamily: 'serif', fontSize: '22px', margin: '0 0 6px 0', color: '#002B49' }}>
              Artemis Süit ve Odalarını Keşfedin
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
              Her biri farklı metrekare, manzara ve olanaklara sahip konsept odalarımız (Tümünde açık büfe sabah kahvaltısı fiyata dahildir).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
              {Object.keys(ROOM_PRICES).map((type) => {
                const feat = ROOM_FEATURES[type];
                return (
                  <div key={type} style={guestStyles.showcaseCard}>
                    <img src={ROOM_IMAGES[type]} alt={type} style={guestStyles.showcaseImg} />
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '240px' }}>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '16px', color: '#002B49' }}>{type}</div>
                        <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700', marginTop: '2px' }}>
                          {feat.badge}
                        </div>
                        <p style={{ fontSize: '12px', color: '#475569', margin: '8px 0 6px 0', lineHeight: '1.4' }}>
                          {feat.desc}
                        </p>
                        <div style={{ fontSize: '11px', color: '#166534', fontWeight: '700', backgroundColor: '#f0fdf4', padding: '4px 6px', borderRadius: '4px', display: 'inline-block' }}>
                          {feat.board}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '900', color: '#002B49' }}>
                          {ROOM_PRICES[type].toLocaleString('tr-TR')} ₺ <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748b' }}>/ Gece</span>
                        </span>
                        <button
                          onClick={() => {
                            setRoomType(type);
                            setIsModalOpen(true);
                          }}
                          style={styles.btnDark}
                        >
                          Rezerve Et
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '30px' }}>
            <h2 style={{ fontFamily: 'serif', fontSize: '22px', margin: '0 0 16px 0', color: '#002B49' }}>
              Misafirlerimizin Yorumları & Deneyimleri
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', backgroundColor: '#ffffff' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#002B49' }}>Siz de Yorum Bırakın</h4>
                
                {hasEligibleCompletedStay ? (
                  <form onSubmit={handleAddReview} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Adınız Soyadınız"
                      value={newReviewGuest}
                      onChange={(e) => setNewReviewGuest(e.target.value)}
                      required
                      style={styles.modalInput}
                    />
                    <select
                      value={newReviewRoom}
                      onChange={(e) => setNewReviewRoom(e.target.value)}
                      style={styles.modalInput}
                    >
                      <option value="Standart Oda">Standart Oda</option>
                      <option value="Deluxe King Süit">Deluxe King Süit</option>
                      <option value="Executive Süit">Executive Süit</option>
                      <option value="Presidential Süit">Presidential Süit</option>
                    </select>
                    <select
                      value={newReviewRating}
                      onChange={(e) => setNewReviewRating(e.target.value)}
                      style={styles.modalInput}
                    >
                      <option value="5">★★★★★ (5 Yıldız - Mükemmel)</option>
                      <option value="4">★★★★☆ (4 Yıldız - Çok İyi)</option>
                      <option value="3">★★★☆☆ (3 Yıldız - Ortalama)</option>
                    </select>
                    <textarea
                      rows="3"
                      placeholder="Sabah kahvaltısı, oda konforu ve otel deneyiminizi paylaşın..."
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      required
                      style={{ ...styles.modalInput, resize: 'vertical' }}
                    />
                    <button type="submit" style={styles.btnDark}>
                      Yorumumu Gönder
                    </button>
                  </form>
                ) : (
                  <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                    🔒 <strong>Yorum Yapma Şartı:</strong>
                    <p style={{ margin: '6px 0 0 0' }}>
                      Otelimizi değerlendirebilmeniz için Artemis Luxury Resort'ta <strong>tamamlanmış bir konaklamanızın (çıkış yapılmış)</strong> bulunması gerekmektedir. Konaklamanız bittikten sonra bu form otomatik olarak aktifleşecektir.
                    </p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reviews.map((rev) => (
                  <div key={rev.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', backgroundColor: '#ffffff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '700', color: '#002B49' }}>{rev.guest} • <span style={{ fontSize: '12px', color: '#64748b' }}>{rev.room}</span></span>
                      <span style={{ color: '#f59e0b' }}>{'★'.repeat(rev.rating)}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#334155', margin: '8px 0 4px 0' }}>"{rev.comment}"</p>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{rev.date} • Doğrulanmış Misafir</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {}
        {isAdminAuthModalOpen && (
          <div style={styles.modalBg}>
            <div style={{ ...styles.modalContent, width: '400px' }}>
              <div style={styles.modalHeader}>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#002B49' }}>🔒 Yönetici Giriş Doğrulaması</h3>
                <span onClick={() => setIsAdminAuthModalOpen(false)} style={{ cursor: 'pointer', fontSize: '16px' }}>✕</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '8px 0 14px 0' }}>
                Yönetici paneline yalnızca yetkili yönetici erişebilir.
              </p>

              {adminAuthError && (
                <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px', textAlign: 'center' }}>
                  {adminAuthError}
                </div>
              )}

              <form onSubmit={handleVerifyAdminSwitch} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={styles.modalLabel}>Yönetici E-posta</label>
                  <input
                    type="email"
                    placeholder="fatima@test.com"
                    value={adminUsernameInput}
                    onChange={(e) => setAdminUsernameInput(e.target.value)}
                    required
                    style={styles.modalInput}
                  />
                </div>
                <div>
                  <label style={styles.modalLabel}>Şifre</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    required
                    style={styles.modalInput}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setIsAdminAuthModalOpen(false)} style={styles.modalCancelBtn}>
                    İptal
                  </button>
                  <button type="submit" style={styles.btnDark}>
                    Doğrula ve Panele Geç
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {}
        {isModalOpen && (
          <div style={styles.modalBg}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h3 style={{ margin: 0, fontSize: '18px', fontFamily: 'serif' }}>Artemis Oda Rezervasyonu</h3>
                <span onClick={() => setIsModalOpen(false)} style={{ cursor: 'pointer', fontSize: '16px' }}>✕</span>
              </div>
              <form onSubmit={handleCreateReservation} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
                <div>
                  <label style={styles.modalLabel}>Adınız ve Soyadınız</label>
                  <input
                    type="text"
                    placeholder="Tam adınızı giriniz"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                    style={styles.modalInput}
                  />
                </div>

                <div>
                  <label style={styles.modalLabel}>İletişim E-posta Adresi</label>
                  <input
                    type="email"
                    value={loggedUserEmail}
                    disabled
                    style={{ ...styles.modalInput, backgroundColor: '#f1f5f9' }}
                  />
                </div>

                <div>
                  <label style={styles.modalLabel}>Oda Tipi</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    style={styles.modalInput}
                  >
                    <option value="Standart Oda">Standart Oda (Bahçe Manzaralı • 2.500 ₺)</option>
                    <option value="Deluxe King Süit">Deluxe King Süit (Kısmi Deniz • 4.500 ₺)</option>
                    <option value="Executive Süit">Executive Süit (Panoramik Deniz • 6.800 ₺)</option>
                    <option value="Presidential Süit">Presidential Süit (Penthouse Teras • 12.000 ₺)</option>
                  </select>
                  <div style={{ fontSize: '11px', color: '#166534', fontWeight: '600', marginTop: '4px' }}>
                    ✓ Seçilen oda için açık büfe sabah kahvaltısı fiyata dahildir.
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={styles.modalLabel}>Giriş Tarihi (Check-in)</label>
                    <input
                      type="date"
                      min={todayStr}
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      required
                      style={styles.modalInput}
                    />
                  </div>
                  <div>
                    <label style={styles.modalLabel}>Çıkış Tarihi (Check-out)</label>
                    <input
                      type="date"
                      min={checkInDate || todayStr}
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      required
                      style={styles.modalInput}
                    />
                  </div>
                </div>

                <div style={styles.priceSummaryBox}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Gecelik Tarife: </span>
                    <strong>{ROOM_PRICES[roomType]?.toLocaleString('tr-TR')} ₺</strong>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#002B49' }}>
                    Toplam Tutar: {calculateTotal(roomType, checkInDate, checkOutDate).toLocaleString('tr-TR')} ₺
                  </div>
                </div>

                {}
                <div>
                  <label style={styles.modalLabel}>Ödeme Tercihi</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={styles.modalInput}
                  >
                    <option value="Kredi Kartı ile Güvenli Ödeme">Kredi Kartı ile Güvenli Ödeme</option>
                    <option value="Banka Kartı">Banka Kartı</option>
                    <option value="Otelde Ödeme">Otele Girişte Ödeme</option>
                  </select>
                </div>

                {}
                {isCardSelected && (
                  <div style={cardFormStyles.box}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#002B49', marginBottom: '8px' }}>
                      💳 {paymentMethod} Bilgileri
                    </div>

                    <div>
                      <label style={cardFormStyles.label}>Kart Üzerindeki İsim</label>
                      <input
                        type="text"
                        placeholder="Örn: FATIMA CENGİZ"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        required
                        style={cardFormStyles.input}
                      />
                    </div>

                    <div>
                      <label style={cardFormStyles.label}>Kart Numarası</label>
                      <input
                        type="text"
                        maxLength="19"
                        placeholder="4543 •••• •••• ••••"
                        value={cardNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                          setCardNumber(val);
                        }}
                        required
                        style={cardFormStyles.input}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={cardFormStyles.label}>Son Kullanma (AA/YY)</label>
                        <input
                          type="text"
                          maxLength="5"
                          placeholder="12/28"
                          value={cardExpiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '');
                            if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                            setCardExpiry(val);
                          }}
                          required
                          style={cardFormStyles.input}
                        />
                      </div>
                      <div>
                        <label style={cardFormStyles.label}>CVV / Güvenlik</label>
                        <input
                          type="password"
                          maxLength="3"
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          required
                          style={cardFormStyles.input}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={styles.modalCancelBtn}>
                    Vazgeç
                  </button>
                  <button type="submit" style={styles.btnDark}>
                    Rezervasyonu Tamamla
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedDetail && (
          <div style={styles.modalBg}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h3 style={{ margin: 0, fontSize: '18px', fontFamily: 'serif' }}>Rezervasyon Bilgisi</h3>
                <span onClick={() => setSelectedDetail(null)} style={{ cursor: 'pointer', fontSize: '16px' }}>✕</span>
              </div>
              <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <img src={selectedDetail.roomImage} alt={selectedDetail.roomType} style={{ width: '100%', height: '140px', borderRadius: '8px', objectFit: 'cover' }} />
                <div><strong>Rezervasyon No:</strong> {selectedDetail.code}</div>
                <div><strong>Misafir:</strong> {selectedDetail.guestName}</div>
                <div><strong>E-posta:</strong> {selectedDetail.guestEmail}</div>
                <div><strong>Oda:</strong> {selectedDetail.roomType} (No:{selectedDetail.roomNumber})</div>
                <div><strong>Konsept:</strong> Açık Büfe Sabah Kahvaltısı Dahil</div>
                <div><strong>Tarihler:</strong> {selectedDetail.startDate.toLocaleDateString('tr-TR')} - {selectedDetail.endDate.toLocaleDateString('tr-TR')} ({selectedDetail.nights} Gece)</div>
                <div><strong>Durum:</strong> <span style={{ color: selectedDetail.statusBadgeColor, fontWeight: '700' }}>{selectedDetail.occupancyStatus}</span></div>
                <div><strong>Toplam Tutar:</strong> <span style={{ fontWeight: 'bold' }}>{selectedDetail.isCancelled ? '0 ₺ (İptal Edildi)' : selectedDetail.amount}</span></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button onClick={() => setSelectedDetail(null)} style={styles.btnDark}>
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  
  return (
    <div style={styles.dashboard}>
      {toast && <div style={styles.toast}>{toast}</div>}

      <aside style={styles.sidebar}>
        <div style={styles.brandContainer}>
          <div style={styles.brandTitle}>A R T E M İ S</div>
          <div style={styles.brandSub}>HOTELS & LUXURY RESORT • ANTALYA</div>
          <div style={{ fontSize: '10px', color: '#059669', fontWeight: '700', marginTop: '4px' }}>
            ● Yetkili Yönetici: {ADMIN_EMAIL}
          </div>
        </div>

        <div style={styles.menuGroup}>
          <div style={styles.sectionHeader}>GENEL BAKIŞ</div>
          <div
            onClick={() => setActiveMenu('Dashboard')}
            style={{ ...styles.menuItem, ...(activeMenu === 'Dashboard' ? styles.menuItemActive : {}) }}
          >
            📊 Kontrol Paneli
          </div>
        </div>

        <div style={styles.menuGroup}>
          <div style={styles.sectionHeader}>REZERVASYON & RESEPSİYON</div>
          <div
            onClick={() => setActiveMenu('Rezervasyonlar')}
            style={{ ...styles.menuItem, ...(activeMenu === 'Rezervasyonlar' ? styles.menuItemActive : {}) }}
          >
            📋 Rezervasyonlar
          </div>
          <div
            onClick={() => {
              setBookingSource('Resepsiyon (Doğrudan)');
              setIsModalOpen(true);
            }}
            style={styles.menuItem}
          >
            📥 Giriş Yap (Check-in)
          </div>
          <div
            onClick={() => setActiveMenu('Odalar')}
            style={{ ...styles.menuItem, ...(activeMenu === 'Odalar' ? styles.menuItemActive : {}) }}
          >
            🏨 300 Oda Yönetimi
          </div>
          <div
            onClick={() => setActiveMenu('Takvim')}
            style={{ ...styles.menuItem, ...(activeMenu === 'Takvim' ? styles.menuItemActive : {}) }}
          >
            📅 Takvim
          </div>
        </div>

        <div style={styles.menuGroup}>
          <div style={styles.sectionHeader}>MALİ VE MİSAFİR İLİŞKİLERİ</div>
          <div
            onClick={() => setActiveMenu('Rehber')}
            style={{ ...styles.menuItem, ...(activeMenu === 'Rehber' ? styles.menuItemActive : {}) }}
          >
            👥 Misafir Rehberi
          </div>
          <div
            onClick={() => setActiveMenu('Yorumlar')}
            style={{ ...styles.menuItem, ...(activeMenu === 'Yorumlar' ? styles.menuItemActive : {}) }}
          >
            💬 Misafir Yorumları
          </div>
          <div
            onClick={() => setActiveMenu('Ödemeler')}
            style={{ ...styles.menuItem, ...(activeMenu === 'Ödemeler' ? styles.menuItemActive : {}) }}
          >
            💳 Ödemeler & Kasa
          </div>
        </div>

        <div style={styles.menuGroup}>
          <div style={styles.sectionHeader}>SİSTEM</div>
          <div
            onClick={() => setActiveMenu('Bildirimler')}
            style={{ ...styles.menuItem, ...(activeMenu === 'Bildirimler' ? styles.menuItemActive : {}) }}
          >
            🔔 Bildirimler
          </div>
          <div onClick={handleLogout} style={{ ...styles.menuItem, color: '#ef4444', marginTop: '16px' }}>
            🚪 Çıkış Yap
          </div>
        </div>
      </aside>

      <main style={styles.main}>
        {}
        {activeMenu === 'Rezervasyonlar' && (
          <div>
            <div style={styles.header}>
              <div>
                <h1 style={styles.title}>Rezervasyon & Kanal Yönetimi (Yönetici)</h1>
                <p style={styles.subtitle}>Web sitesi ve acentelerden gelen tüm rezervasyonlar anlık listelenir</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setBookingSource('Resepsiyon (Doğrudan)');
                    setIsModalOpen(true);
                  }}
                  style={styles.btnDark}
                >
                  + Yeni Rezervasyon / Check-in
                </button>
              </div>
            </div>

            <div style={styles.searchBar}>
              <span style={{ color: '#94a3b8' }}>🔍</span>
              <input
                type="text"
                placeholder="Misafir adı, e-posta, rezervasyon no veya oda tipi ile arayın..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
              {searchTerm && (
                <span onClick={() => setSearchTerm('')} style={{ cursor: 'pointer', color: '#94a3b8', fontSize: '12px' }}>
                  ✕ Temizle
                </span>
              )}
            </div>

            <div style={{ marginTop: '20px' }}>
              <div style={styles.summaryContainer}>
                <div style={styles.summaryCard}>
                  <span style={styles.summaryLabel}>TOPLAM KASA (Nakit/POS)</span>
                  <span style={{ ...styles.summaryValue, color: '#10b981' }}>{totalVaultBalance.toLocaleString('tr-TR')} ₺</span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Net kasa bakiyesi</span>
                </div>
                <div style={styles.summaryCard}>
                  <span style={styles.summaryLabel}>Şu Anda Kalan Misafir</span>
                  <span style={{ ...styles.summaryValue, color: '#002B49' }}>{currentlyStayingCount}</span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Otelde bulunan</span>
                </div>
                <div style={styles.summaryCard}>
                  <span style={styles.summaryLabel}>Gelecekte Kalacaklar</span>
                  <span style={{ ...styles.summaryValue, color: '#2563eb' }}>
                    {parsedList.filter((r) => !r.isCancelled && !r.isCurrentlyInHotel && r.startDate > new Date()).length}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Giriş beklenen</span>
                </div>
                <div style={{ ...styles.summaryCard, borderRight: 'none' }}>
                  <span style={styles.summaryLabel}>Misafir İptalleri</span>
                  <span style={{ ...styles.summaryValue, color: '#ef4444' }}>{totalCancelledCount}</span>
                  <span style={{ fontSize: '11px', color: '#ef4444' }}>Odayı boşa çıkaran iptaller</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)} style={styles.dropdown}>
                <option value="Tümü">Tüm Oda Tipleri</option>
                <option value="Deluxe King Süit">Deluxe King Süit (4.500 ₺)</option>
                <option value="Executive Süit">Executive Süit (6.800 ₺)</option>
                <option value="Presidential Süit">Presidential Süit (12.000 ₺)</option>
                <option value="Standart Oda">Standart Oda (2.500 ₺)</option>
              </select>

              <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} style={styles.dropdown}>
                <option value="Tümü">Tüm Satış Kanalları</option>
                <option value="Artemis Doğrudan Web">Artemis Doğrudan Web</option>
                <option value="Booking.com">Booking.com</option>
                <option value="Expedia">Expedia</option>
                <option value="Ots / ETS Tur">Ots / ETS Tur</option>
                <option value="Resepsiyon (Doğrudan)">Resepsiyon (Doğrudan)</option>
              </select>

              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.dropdown}>
                <option value="Tümü">Tüm Durumlar</option>
                <option value="Aktif">Şu Anda Kalanlar</option>
                <option value="Gelecek">Gelecekte Kalacaklar</option>
                <option value="İptal">Misafir İptal Etti</option>
              </select>

              <button
                onClick={() => { setRoomFilter('Tümü'); setSourceFilter('Tümü'); setStatusFilter('Tümü'); setSearchTerm(''); }}
                style={styles.filterActionBtn}
              >
                Filtreleri Temizle
              </button>
            </div>

            <div style={{ marginTop: '22px' }}>
              <div style={styles.tableBox}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thRow}>
                      <th style={styles.th}>Görsel</th>
                      <th style={styles.th}>Rezervasyon No</th>
                      <th style={styles.th}>Misafir Adı</th>
                      <th style={styles.th}>Misafir E-posta</th>
                      <th style={styles.th}>Kanal</th>
                      <th style={styles.th}>Oda Detayı</th>
                      <th style={styles.th}>Tarihler</th>
                      <th style={styles.th}>Toplam Tutar</th>
                      <th style={styles.th}>Durum</th>
                      <th style={{ ...styles.th, textAlign: 'center' }}>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.length === 0 ? (
                      <tr>
                        <td colSpan="10" style={styles.emptyTd}>Görüntülenecek rezervasyon bulunmuyor.</td>
                      </tr>
                    ) : (
                      filteredList.map((r) => (
                        <tr key={r.id} style={{ ...styles.tr, backgroundColor: r.isCancelled ? '#fff5f5' : '#ffffff' }}>
                          <td style={styles.td}>
                            <img src={r.roomImage} alt={r.roomType} style={styles.roomThumb} />
                          </td>
                          <td style={styles.tdCode}>{r.code}</td>
                          <td style={styles.tdGuest}>{r.guestName}</td>
                          <td style={{ ...styles.td, color: '#2563eb', fontWeight: '500' }}>
                            ✉️ {r.guestEmail}
                          </td>
                          <td style={styles.td}>
                            <span style={styles.badgeChannel}>🌐 {r.bookingSource}</span>
                          </td>
                          <td style={styles.tdRoom}>
                            <div style={{ fontWeight: '600' }}>{r.roomType}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>• No:{r.roomNumber} ({ROOM_PRICES[r.roomType]?.toLocaleString('tr-TR')} ₺)</div>
                            <div style={{ fontSize: '10px', color: '#166534', fontWeight: '600' }}>Sabah Kahvaltısı Dahil</div>
                          </td>
                          <td style={styles.tdStay}>
                            {r.startDate.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })} -{' '}
                            {r.endDate.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}
                            <div style={{ fontSize: '11px', color: '#64748b' }}>({r.nights} Gece)</div>
                          </td>
                          <td style={{ ...styles.td, fontWeight: '700', color: r.isCancelled ? '#94a3b8' : '#0f172a' }}>
                            {r.isCancelled ? '0 ₺ (İade)' : r.amount}
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                fontWeight: '700',
                                fontSize: '11px',
                                backgroundColor: r.statusBgColor,
                                color: r.statusBadgeColor,
                                display: 'inline-block',
                              }}
                            >
                              ● {r.occupancyStatus}
                            </span>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              {!r.isCancelled && (
                                <button
                                  onClick={() => handleCancelReservation(r)}
                                  style={styles.btnTableCancel}
                                >
                                  İptal Et
                                </button>
                              )}
                              <button onClick={() => setSelectedDetail(r)} style={styles.viewBtn}>
                                Detay
                              </button>
                              <button onClick={() => handleDelete(r.id)} style={styles.delBtn}>
                                Sil
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {}
        {activeMenu === 'Dashboard' && (
          <div>
            <div style={styles.header}>
              <h1 style={styles.title}>Artemis Genel Kontrol Paneli</h1>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ ...styles.dashMetricCard, border: '2px solid #10b981', backgroundColor: '#f0fdf4' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#047857' }}>TOPLAM KASA BAKİYESİ</span>
                <span style={{ fontSize: '32px', fontWeight: '900', color: '#065f46' }}>{totalVaultBalance.toLocaleString('tr-TR')} ₺</span>
              </div>
              <div style={styles.dashMetricCard}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Bekleyen Alacaklar</span>
                <span style={{ fontSize: '28px', fontWeight: '800', color: '#f59e0b' }}>{pendingRevenue.toLocaleString('tr-TR')} ₺</span>
              </div>
              <div style={styles.dashMetricCard}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Müsait Boş Odalar</span>
                <span style={{ fontSize: '28px', fontWeight: '800', color: '#002B49' }}>{300 - currentlyStayingCount}</span>
              </div>
              <div style={styles.dashMetricCard}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Misafir Memnuniyeti</span>
                <span style={{ fontSize: '28px', fontWeight: '800', color: '#f59e0b' }}>4.9 / 5</span>
              </div>
            </div>
          </div>
        )}

        {}
        {activeMenu === 'Odalar' && (
          <div>
            <div style={styles.header}>
              <div>
                <h1 style={styles.title}>Artemis 300 Oda & Kat Yönetimi</h1>
                <p style={styles.subtitle}>
                  150 Standart Oda, 100 Deluxe King Süit, 40 Executive Süit ve 10 Presidential Süit Envanteri
                </p>
              </div>
              <button
                onClick={() => {
                  setBookingSource('Resepsiyon (Doğrudan)');
                  setIsModalOpen(true);
                }}
                style={styles.btnDark}
              >
                + Odaya Rezervasyon Ata
              </button>
            </div>

            {}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              {['Tümü', 'Standart Oda', 'Deluxe King Süit', 'Executive Süit', 'Presidential Süit'].map((t) => (
                <button
                  key={t}
                  onClick={() => { setRoomTypeFilterTab(t); setRoomPage(1); }}
                  style={{
                    ...styles.filterBtn,
                    ...(roomTypeFilterTab === t ? styles.filterBtnActive : {}),
                  }}
                >
                  {t} {t === 'Standart Oda' ? '(150 Oda)' : t === 'Deluxe King Süit' ? '(100 Oda)' : t === 'Executive Süit' ? '(40 Oda)' : t === 'Presidential Süit' ? '(10 Oda)' : '(300 Oda)'}
                </button>
              ))}
            </div>

            {}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ ...styles.searchBar, flex: 1, padding: '8px 14px' }}>
                <span style={{ color: '#94a3b8' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Oda no (örn: 105, 260, 355, 395) veya kalan misafir ismi ile arayın..."
                  value={roomSearchInput}
                  onChange={(e) => { setRoomSearchInput(e.target.value); setRoomPage(1); }}
                  style={styles.searchInput}
                />
              </div>

              <select
                value={roomStatusFilterTab}
                onChange={(e) => { setRoomStatusFilterTab(e.target.value); setRoomPage(1); }}
                style={styles.dropdown}
              >
                <option value="Tümü">Tüm Durumlar</option>
                <option value="Müsait">Yalnızca Müsait Odalar</option>
                <option value="Dolu">Yalnızca Dolu Odalar</option>
              </select>
            </div>

            {}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {paginatedRooms.map((room) => {
                const activeRes = parsedList.find((r) => (r.roomNumber === room.no || r.roomNumber.includes(room.no)) && r.isCurrentlyInHotel);
                const isOccupied = !!activeRes;
                return (
                  <div key={room.no} style={styles.hdRoomCard}>
                    <div style={{ position: 'relative' }}>
                      <img src={ROOM_IMAGES[room.type]} alt={room.type} style={styles.hdRoomImg} />
                      <span
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          backgroundColor: isOccupied ? '#fee2e2' : '#ecfdf5',
                          color: isOccupied ? '#ef4444' : '#059669',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                      >
                        ● {isOccupied ? 'DOLU (Şu An Kalıyor)' : 'MÜSAİT'}
                      </span>
                    </div>

                    <div style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '17px', fontWeight: '800', color: '#002B49' }}>Oda {room.no}</span>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>{room.floor}</span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '600', marginTop: '3px', color: '#0f172a' }}>{room.type}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>{room.capacity} • {room.bed}</div>

                      <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '10px', color: '#64748b' }}>Tarife</div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#002B49' }}>
                            {ROOM_PRICES[room.type]?.toLocaleString('tr-TR')} ₺
                          </div>
                        </div>

                        {isOccupied ? (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '10px', color: '#64748b' }}>Konuk</div>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#b45309' }}>
                              {activeRes.guestName.slice(0, 12)}
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setRoomNumber(room.no);
                              setRoomType(room.type);
                              setBookingSource('Resepsiyon (Doğrudan)');
                              setIsModalOpen(true);
                            }}
                            style={styles.btnCardAction}
                          >
                            Giriş Ver
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', padding: '12px 0', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                Toplam {filteredHotelRooms.length} odadan {(roomPage - 1) * roomsPerPage + 1} - {Math.min(roomPage * roomsPerPage, filteredHotelRooms.length)} arası gösteriliyor
              </span>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  disabled={roomPage === 1}
                  onClick={() => setRoomPage((p) => Math.max(1, p - 1))}
                  style={{ ...styles.pageBtn, opacity: roomPage === 1 ? 0.4 : 1 }}
                >
                  ◀ Önceki Sayfa
                </button>
                <span style={{ padding: '6px 12px', fontSize: '13px', fontWeight: '700', color: '#002B49' }}>
                  Sayfa {roomPage} / {Math.max(1, totalPages)}
                </span>
                <button
                  disabled={roomPage >= totalPages}
                  onClick={() => setRoomPage((p) => Math.min(totalPages, p + 1))}
                  style={{ ...styles.pageBtn, opacity: roomPage >= totalPages ? 0.4 : 1 }}
                >
                  Sonraki Sayfa ▶
                </button>
              </div>
            </div>
          </div>
        )}

        {}
        {activeMenu === 'Takvim' && (
          <div>
            <div style={styles.header}>
              <div>
                <h1 style={styles.title}>Artemis Rezervasyon & Doluluk Takvimi</h1>
                <p style={styles.subtitle}>
                  Ekim 2026 • Şu anda kalan, geçmişte kalan ve gelecekte kalacak tüm misafirlerin gün dökümü
                </p>
              </div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ margin: 0, color: '#002B49', fontFamily: 'serif', fontSize: '20px' }}>Ekim 2026</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: '#ecfdf5', color: '#059669', borderRadius: '6px', fontWeight: '700' }}>
                    ● Şu Anda Kalan
                  </span>
                  <span style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '6px', fontWeight: '700' }}>
                    ● Gelecekte Kalacak
                  </span>
                  <span style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '6px', fontWeight: '700' }}>
                    ● Geçmişte Kalan
                  </span>
                  <span style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '6px', fontWeight: '700' }}>
                    ✕ Misafir İptal Etti
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map((day) => (
                  <div key={day} style={{ textAlign: 'center', fontWeight: '700', fontSize: '13px', color: '#64748b', paddingBottom: '8px' }}>
                    {day}
                  </div>
                ))}

                {Array.from({ length: 31 }, (_, i) => i + 1).map((dayNumber) => {
                  const targetDate = new Date(2026, 9, dayNumber);
                  const now = new Date();

                  const dayEvents = parsedList.filter((r) => {
                    const s = new Date(r.startDate.getFullYear(), r.startDate.getMonth(), r.startDate.getDate());
                    const e = new Date(r.endDate.getFullYear(), r.endDate.getMonth(), r.endDate.getDate());
                    return targetDate >= s && targetDate <= e;
                  });

                  return (
                    <div
                      key={dayNumber}
                      style={{
                        minHeight: '105px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '6px',
                        backgroundColor: dayEvents.length > 0 ? '#f8fafc' : '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <span style={{ fontWeight: '800', fontSize: '13px', color: '#002B49' }}>
                        {dayNumber}
                      </span>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto' }}>
                        {dayEvents.map((ev) => {
                          let labelBg = '#eff6ff';
                          let labelColor = '#2563eb';
                          let statusText = 'Gelecek:';

                          if (ev.isCancelled) {
                            labelBg = '#fee2e2';
                            labelColor = '#dc2626';
                            statusText = 'İptal:';
                          } else if (now >= ev.startDate && now <= ev.endDate) {
                            labelBg = '#dcfce7';
                            labelColor = '#15803d';
                            statusText = 'Kalan:';
                          } else if (targetDate < now) {
                            labelBg = '#f1f5f9';
                            labelColor = '#475569';
                            statusText = 'Geçmiş:';
                          }

                          return (
                            <div
                              key={ev.id}
                              style={{
                                fontSize: '10px',
                                backgroundColor: labelBg,
                                color: labelColor,
                                padding: '2px 4px',
                                borderRadius: '4px',
                                fontWeight: '700',
                                border: `1px solid ${labelColor}30`,
                              }}
                            >
                              {statusText} {ev.guestName.slice(0, 10)} (No:{ev.roomNumber})
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {}
        {activeMenu === 'Rehber' && (
          <div>
            <div style={styles.header}>
              <div>
                <h1 style={styles.title}>Artemis Misafir Rehberi</h1>
                <p style={styles.subtitle}>Kayıtlı misafirlerin e-posta, statü ve toplam harcama listesi</p>
              </div>
            </div>

            <div style={styles.tableBox}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Misafir Adı</th>
                    <th style={styles.th}>İletişim E-posta</th>
                    <th style={styles.th}>Rezervasyon Kanalı</th>
                    <th style={styles.th}>Müşteri Statüsü</th>
                    <th style={styles.th}>Son Konaklanan Oda</th>
                    <th style={styles.th}>Toplam Harcama</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedList.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={styles.emptyTd}>Henüz kayıtlı misafir bulunmuyor.</td>
                    </tr>
                  ) : (
                    parsedList.map((r) => {
                      const badge = getLoyaltyBadge(r.guestName);
                      return (
                        <tr key={r.id} style={styles.tr}>
                          <td style={{ ...styles.td, fontWeight: '700', color: '#002B49' }}>{r.guestName}</td>
                          <td style={{ ...styles.td, color: '#2563eb', fontWeight: '600' }}>✉️ {r.guestEmail}</td>
                          <td style={styles.td}>🌐 {r.bookingSource}</td>
                          <td style={styles.td}>
                            <span
                              style={{
                                backgroundColor: badge.bg,
                                color: badge.color,
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '800',
                                display: 'inline-block',
                              }}
                            >
                              ● {badge.text}
                            </span>
                          </td>
                          <td style={styles.td}>{r.roomType} (No:{r.roomNumber})</td>
                          <td style={{ ...styles.td, fontWeight: '700', color: '#002B49' }}>
                            {r.isCancelled ? '0 ₺ (İptal)' : r.amount}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {}
        {activeMenu === 'Yorumlar' && (
          <div>
            <div style={styles.header}>
              <h1 style={styles.title}>Misafir Yorumları Yönetimi</h1>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reviews.map((rev) => (
                <div key={rev.id} style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px', backgroundColor: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ color: '#002B49' }}>{rev.guest} ({rev.room})</strong>
                    <span style={{ color: '#f59e0b' }}>{'★'.repeat(rev.rating)}</span>
                  </div>
                  <p style={{ margin: '8px 0', fontSize: '13px' }}>"{rev.comment}"</p>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{rev.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {}
        {activeMenu === 'Ödemeler' && (
          <div>
            <div style={styles.header}>
              <div>
                <h1 style={styles.title}>Artemis Kasa & Muhasebe Dökümü</h1>
                <p style={styles.subtitle}>Tüm konaklama tahsilatları ve net kasa durumu</p>
              </div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#10b981', backgroundColor: '#f0fdf4', padding: '8px 16px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                Kasa Net Bakiye: {totalVaultBalance.toLocaleString('tr-TR')} ₺
              </div>
            </div>

            <div style={styles.tableBox}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Fatura No</th>
                    <th style={styles.th}>Misafir Adı</th>
                    <th style={styles.th}>Misafir E-posta</th>
                    <th style={styles.th}>Kanal</th>
                    <th style={styles.th}>Tarih</th>
                    <th style={styles.th}>Tutar</th>
                    <th style={styles.th}>Tahsilat Durumu</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedList.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={styles.emptyTd}>Ödeme kaydı bulunamadı.</td>
                    </tr>
                  ) : (
                    parsedList.map((r, idx) => (
                      <tr key={r.id} style={styles.tr}>
                        <td style={styles.tdCode}>INV-2026-00{idx + 1}</td>
                        <td style={styles.tdGuest}>{r.guestName}</td>
                        <td style={{ ...styles.td, color: '#2563eb' }}>{r.guestEmail}</td>
                        <td style={styles.td}>🌐 {r.bookingSource}</td>
                        <td style={styles.td}>{r.startDate.toLocaleDateString('tr-TR')}</td>
                        <td style={{ ...styles.td, fontWeight: '700', color: r.isCancelled ? '#94a3b8' : '#002B49' }}>
                          {r.isCancelled ? '0 ₺ (İade/İptal)' : r.amount}
                        </td>
                        <td style={styles.td}>
                          <span style={r.isCancelled ? styles.badgeCancelled : styles.badgePaid}>
                            ● {r.isCancelled ? 'İade / İptal' : r.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {}
        {activeMenu === 'Bildirimler' && (
          <div>
            <div style={styles.header}>
              <h1 style={styles.title}>Sistem Bildirimleri</h1>
            </div>
            <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', backgroundColor: '#ffffff' }}>
              🔔 Yetkili yönetici paneli ({ADMIN_EMAIL}) aktif.
            </div>
          </div>
        )}
      </main>

      {}
      {isModalOpen && (
        <div style={styles.modalBg}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#002B49' }}>Otel Rezervasyonu & Misafir Girişi (Check-in)</h3>
              <span onClick={() => setIsModalOpen(false)} style={{ cursor: 'pointer', fontSize: '16px' }}>✕</span>
            </div>
            <form onSubmit={handleCreateReservation} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
              <div>
                <label style={styles.modalLabel}>Misafir Adı ve Soyadı</label>
                <input
                  type="text"
                  placeholder="Örn: David Miller"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  style={styles.modalInput}
                />
              </div>

              <div>
                <label style={styles.modalLabel}>Misafir E-posta Adresi</label>
                <input
                  type="email"
                  placeholder="misafir@musteri.com"
                  value={guestEmailInput}
                  onChange={(e) => setGuestEmailInput(e.target.value)}
                  required
                  style={styles.modalInput}
                />
              </div>

              <div>
                <label style={styles.modalLabel}>Rezervasyon Kanalı</label>
                <select
                  value={bookingSource}
                  onChange={(e) => setBookingSource(e.target.value)}
                  style={styles.modalInput}
                >
                  <option value="Artemis Doğrudan Web">Artemis Doğrudan Web</option>
                  <option value="Booking.com">Booking.com</option>
                  <option value="Expedia">Expedia</option>
                  <option value="Ots / ETS Tur">Ots / ETS Tur</option>
                  <option value="Resepsiyon (Doğrudan)">Resepsiyon (Doğrudan)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                <div>
                  <label style={styles.modalLabel}>Oda Tipi</label>
                  <select
                    value={roomType}
                    onChange={(e) => {
                      const selected = e.target.value;
                      setRoomType(selected);
                      if (selected === 'Standart Oda') setRoomNumber('101');
                      if (selected === 'Deluxe King Süit') setRoomNumber('251');
                      if (selected === 'Executive Süit') setRoomNumber('351');
                      if (selected === 'Presidential Süit') setRoomNumber('391');
                    }}
                    style={styles.modalInput}
                  >
                    <option value="Standart Oda">Standart Oda (2.500 ₺)</option>
                    <option value="Deluxe King Süit">Deluxe King Süit (4.500 ₺)</option>
                    <option value="Executive Süit">Executive Süit (6.800 ₺)</option>
                    <option value="Presidential Süit">Presidential Süit (12.000 ₺)</option>
                  </select>
                </div>

                <div>
                  <label style={styles.modalLabel}>Oda Numarası</label>
                  <select
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    style={styles.modalInput}
                    required
                  >
                    {availableRoomNumbersForType.map((r) => {
                      const isOccupied = parsedList.some((res) => (res.roomNumber === r.no || res.roomNumber.includes(r.no)) && res.isCurrentlyInHotel);
                      return (
                        <option key={r.no} value={r.no} disabled={isOccupied}>
                          Oda {r.no} {isOccupied ? '(ŞU AN DOLU)' : `(${r.floor})`}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={styles.modalLabel}>Giriş Tarihi (Check-in)</label>
                  <input
                    type="date"
                    min={todayStr}
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    required
                    style={styles.modalInput}
                  />
                </div>
                <div>
                  <label style={styles.modalLabel}>Çıkış Tarihi (Check-out)</label>
                  <input
                    type="date"
                    min={checkInDate || todayStr}
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    required
                    style={styles.modalInput}
                  />
                </div>
              </div>

              <div style={styles.priceSummaryBox}>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Gecelik Tarife: </span>
                  <strong>{ROOM_PRICES[roomType]?.toLocaleString('tr-TR')} ₺</strong>
                </div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#002B49' }}>
                  Toplam Tutar: {calculateTotal(roomType, checkInDate, checkOutDate).toLocaleString('tr-TR')} ₺
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={styles.modalLabel}>Ödeme Yöntemi</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={styles.modalInput}>
                    <option value="Kredi Kartı (POS)">Kredi Kartı (POS)</option>
                    <option value="Banka Kartı">Banka Kartı</option>
                    <option value="Nakit">Nakit (Resepsiyon)</option>
                    <option value="Havale / EFT">Havale / EFT</option>
                  </select>
                </div>
                <div>
                  <label style={styles.modalLabel}>Ödeme Durumu</label>
                  <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} style={styles.modalInput}>
                    <option value="Ödendi">Ödendi (Kasaya Girer)</option>
                    <option value="Beklemede">Çıkışta Ödenecek</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.modalCancelBtn}>
                  Vazgeç
                </button>
                <button type="submit" style={styles.btnDark}>
                  Girişi ve Rezervasyonu Onayla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedDetail && (
        <div style={styles.modalBg}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Rezervasyon Detayı</h3>
              <span onClick={() => setSelectedDetail(null)} style={{ cursor: 'pointer' }}>✕</span>
            </div>
            <div style={{ marginTop: '12px', fontSize: '13px' }}>
              <div><strong>Kod:</strong> {selectedDetail.code}</div>
              <div><strong>Misafir:</strong> {selectedDetail.guestName}</div>
              <div><strong>E-posta:</strong> {selectedDetail.guestEmail}</div>
              <div><strong>Oda:</strong> {selectedDetail.roomType} (No:{selectedDetail.roomNumber})</div>
              <div><strong>Konsept:</strong> Açık Büfe Sabah Kahvaltısı Dahil</div>
              <div><strong>Kanal:</strong> {selectedDetail.bookingSource}</div>
              <div><strong>Tutar:</strong> {selectedDetail.amount}</div>
              <div><strong>Durum:</strong> {selectedDetail.occupancyStatus}</div>
            </div>
            <button onClick={() => setSelectedDetail(null)} style={{ ...styles.btnDark, marginTop: '14px' }}>Kapat</button>
          </div>
        </div>
      )}
    </div>
  );
}


const cardFormStyles = {
  box: {
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '3px',
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '12px',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#ffffff',
  },
};

const guestStyles = {
  page: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#f8fafc',
    fontFamily: '"Inter", sans-serif',
    color: '#0f172a',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '16px 36px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandTitle: {
    fontFamily: 'serif',
    fontSize: '22px',
    fontWeight: '900',
    letterSpacing: '4px',
    color: '#002B49',
  },
  switchRoleBtn: {
    padding: '8px 14px',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  logoutBtn: {
    padding: '8px 14px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  heroBanner: {
    backgroundColor: '#002B49',
    padding: '50px 36px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  heroCtaBtn: {
    padding: '14px 28px',
    backgroundColor: '#f59e0b',
    color: '#002B49',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '800',
    fontSize: '15px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
  },
  amenityBox: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  },
  emptyBox: {
    padding: '40px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px dashed #cbd5e1',
    color: '#64748b',
    fontSize: '14px',
  },
  reservationCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '16px',
    display: 'flex',
    gap: '16px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
  },
  reservationImg: {
    width: '130px',
    height: '110px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  cancelBtn: {
    padding: '6px 12px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  showcaseCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
  },
  showcaseImg: {
    width: '100%',
    height: '155px',
    objectFit: 'cover',
  },
};

const styles = {
  dashboard: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    overflowX: 'hidden',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    fontFamily: '"Inter", sans-serif',
    color: '#0f172a',
  },
  toast: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: '#002B49',
    color: '#ffffff',
    padding: '12px 20px',
    borderRadius: '10px',
    fontSize: '13px',
    zIndex: 9999,
    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #f1f5f9',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    flexShrink: 0,
  },
  brandContainer: {
    paddingLeft: '10px',
    marginBottom: '6px',
  },
  brandTitle: {
    fontFamily: 'serif',
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '4px',
    color: '#002B49',
  },
  brandSub: {
    fontSize: '9px',
    letterSpacing: '1px',
    color: '#64748b',
    fontWeight: '700',
    marginTop: '2px',
  },
  menuGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  sectionHeader: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: '0.5px',
    padding: '6px 10px',
  },
  menuItem: {
    padding: '8px 12px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#475569',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  menuItemActive: {
    backgroundColor: '#002B49',
    color: '#ffffff',
    fontWeight: '600',
  },
  main: {
    flex: 1,
    minWidth: 0,
    padding: '28px 36px',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    fontFamily: 'serif',
    margin: '0 0 4px 0',
    color: '#002B49',
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
  },
  btnDark: {
    backgroundColor: '#002B49',
    color: '#ffffff',
    border: 'none',
    padding: '9px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnLight: {
    backgroundColor: '#ffffff',
    color: '#002B49',
    border: '1px solid #cbd5e1',
    padding: '9px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnCardAction: {
    padding: '5px 12px',
    backgroundColor: '#002B49',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnTableCancel: {
    padding: '5px 10px',
    border: '1px solid #fecaca',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    padding: '10px 16px',
    border: '1px solid #f1f5f9',
    width: '100%',
    boxSizing: 'border-box',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '13px',
    width: '100%',
    color: '#1e293b',
  },
  summaryContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    border: '1px solid #f1f5f9',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    width: '100%',
  },
  summaryCard: {
    padding: '18px 24px',
    borderRight: '1px solid #f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  summaryLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#0f172a',
  },
  dashMetricCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  dropdown: {
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    fontSize: '13px',
    color: '#0f172a',
    cursor: 'pointer',
    outline: 'none',
  },
  filterActionBtn: {
    padding: '8px 14px',
    backgroundColor: '#f8fafc',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  filterBtn: {
    padding: '6px 14px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    fontSize: '12px',
    fontWeight: '500',
    color: '#475569',
    cursor: 'pointer',
  },
  filterBtnActive: {
    backgroundColor: '#002B49',
    color: '#ffffff',
    borderColor: '#002B49',
    fontWeight: '600',
  },
  pageBtn: {
    padding: '6px 14px',
    backgroundColor: '#ffffff',
    color: '#002B49',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  tableBox: {
    border: '1px solid #f1f5f9',
    borderRadius: '12px',
    overflow: 'hidden',
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  thRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #f1f5f9',
  },
  th: {
    padding: '12px 14px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '12px 14px',
    fontSize: '13px',
    color: '#475569',
    verticalAlign: 'middle',
  },
  roomThumb: {
    width: '58px',
    height: '42px',
    borderRadius: '6px',
    objectFit: 'cover',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
  },
  badgeChannel: {
    backgroundColor: '#f1f5f9',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#002B49',
    display: 'inline-block',
  },
  hdRoomCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  hdRoomImg: {
    width: '100%',
    height: '145px',
    objectFit: 'cover',
    display: 'block',
  },
  tdCode: {
    padding: '12px 14px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#002B49',
  },
  tdGuest: {
    padding: '12px 14px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#0f172a',
  },
  tdRoom: {
    padding: '12px 14px',
    fontSize: '13px',
    color: '#0f172a',
  },
  tdStay: {
    padding: '12px 14px',
    fontSize: '12px',
    color: '#0f172a',
  },
  badgePaid: {
    fontSize: '11px',
    color: '#10b981',
    fontWeight: '600',
    display: 'block',
    marginTop: '2px',
  },
  badgeCancelled: {
    fontSize: '11px',
    color: '#dc2626',
    fontWeight: '600',
    display: 'block',
    marginTop: '2px',
  },
  viewBtn: {
    padding: '5px 10px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    fontSize: '11px',
    color: '#0f172a',
    cursor: 'pointer',
  },
  delBtn: {
    padding: '5px 10px',
    border: '1px solid #fee2e2',
    backgroundColor: '#fef2f2',
    borderRadius: '6px',
    fontSize: '11px',
    color: '#ef4444',
    cursor: 'pointer',
  },
  emptyTd: {
    padding: '36px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '13px',
  },
  modalBg: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 43, 73, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    width: '480px',
    padding: '24px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '5px',
  },
  modalInput: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  priceSummaryBox: {
    backgroundColor: '#f1f5f9',
    padding: '12px 14px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px dashed #cbd5e1',
  },
  modalCancelBtn: {
    padding: '9px 16px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
  },
};

const authStyles = {
  wrapper: {
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Inter", sans-serif',
    backgroundImage: `linear-gradient(rgba(0, 43, 73, 0.45), rgba(0, 43, 73, 0.65)), url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2560&q=95')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  card: {
    width: '430px',
    padding: '40px 36px',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: '20px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(10px)',
    textAlign: 'center',
  },
  brand: {
    fontFamily: 'serif',
    fontSize: '30px',
    fontWeight: '900',
    letterSpacing: '6px',
    color: '#002B49',
    marginBottom: '4px',
  },
  desc: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600',
    marginBottom: '16px',
  },
  roleSelector: {
    display: 'flex',
    backgroundColor: '#f1f5f9',
    borderRadius: '10px',
    padding: '4px',
    marginBottom: '14px',
    gap: '4px',
  },
  roleBtn: {
    flex: 1,
    padding: '9px 10px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontWeight: '600',
    fontSize: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  roleBtnActive: {
    backgroundColor: '#002B49',
    color: '#ffffff',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '12px',
    marginBottom: '14px',
    fontWeight: '600',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    outline: 'none',
    backgroundColor: '#ffffff',
  },
  btn: {
    padding: '13px',
    backgroundColor: '#002B49',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    marginTop: '6px',
    boxShadow: '0 4px 10px rgba(0, 43, 73, 0.3)',
  },
  switchText: {
    marginTop: '16px',
    fontSize: '13px',
    color: '#64748b',
  },
  switchLink: {
    color: '#002B49',
    fontWeight: '700',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};

export default App;
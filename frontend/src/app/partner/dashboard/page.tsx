'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Briefcase,
  ShieldCheck,
  Clock,
  CheckCircle,
  Compass,
  Palette,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  X,
  IndianRupee,
  Users,
  AlertCircle,
  Landmark,
  Send,
  Award,
  Search,
  CheckCircle2,
  XCircle,
  Building2,
  Phone,
  Mail,
  Globe,
  BedDouble,
  Info,
  Maximize2,
  Sliders,
  Check,
  Layers,
  Settings2,
  Tag,
  Utensils,
  Calendar,
  Percent,
} from 'lucide-react';
import {
  getPartnerExperiences,
  createPartnerExperience,
  updatePartnerExperience,
  deletePartnerExperience,
  submitPartnerExperienceForReview,
  getCulturalTraditions,
  getMyPartnerHotels,
  createPartnerHotel,
  updatePartnerHotel,
  submitPartnerHotel,
  deletePartnerHotel,
  getPartnerHotelRooms,
  createPartnerHotelRoom,
  updatePartnerHotelRoom,
  deletePartnerHotelRoom,
  updatePartnerRoomInventory,
  updatePartnerBulkRoomInventory,
  getPartnerRatePlans,
  createPartnerRatePlan,
  updatePartnerRatePlan,
  activatePartnerRatePlan,
  deactivatePartnerRatePlan,
  deletePartnerRatePlan,
  getPartnerHotelBookings,
  ExperienceItem,
  CulturalTraditionDto,
  HotelItem,
  CreateHotelRequest,
  UpdateHotelRequest,
  HotelRoomTypeItem,
  CreateRoomTypeRequest,
  UpdateRoomTypeRequest,
  UpdateInventoryRequest,
  BulkInventoryUpdateRequest,
  HotelRatePlanItem,
  CreateRatePlanRequest,
  UpdateRatePlanRequest,
  HotelBookingDto,
} from '@/lib/api';

const CULTURAL_CATEGORIES = [
  'Handicraft / Artisan',
  'Cultural Workshop',
  'Traditional Food / Culinary',
  'Folk Art / Performance',
  'Local Cultural Business',
  'Traditional Product',
  'Heritage Craft',
];

const TOUR_CATEGORIES = [
  'Heritage Tour',
  'Food Walk',
  'Adventure',
  'Photography',
  'Spiritual Walk',
  'Nature Trail',
];

const HOTEL_CATEGORIES = [
  { value: 'HOTEL', label: 'Hotel' },
  { value: 'RESORT', label: 'Resort' },
  { value: 'HOMESTAY', label: 'Homestay / Local Stay' },
  { value: 'HERITAGE_HOTEL', label: 'Heritage Haveli / Hotel' },
  { value: 'BOUTIQUE', label: 'Boutique Stay' },
  { value: 'GUESTHOUSE', label: 'Guesthouse' },
  { value: 'VILLA', label: 'Private Villa / Estate' },
  { value: 'ECO_LODGE', label: 'Eco Lodge' },
  { value: 'PALACE_HOTEL', label: 'Palace Hotel' },
  { value: 'ASHRAM_DHARAMSHALA', label: 'Ashram / Dharamshala' },
];

export default function PartnerDashboardPage() {
  const { user, partnerDetails, token, role, isAuthenticated, openAuthModal } = useAuth();

  // Experiences & Traditions state
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [traditions, setTraditions] = useState<CulturalTraditionDto[]>([]);
  const [loadingExps, setLoadingExps] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingExp, setEditingExp] = useState<ExperienceItem | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'EXPERIENCES' | 'CULTURE' | 'HOTELS'>('HOTELS');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED'>('ALL');
  const [submittingExpId, setSubmittingExpId] = useState<string | null>(null);
  const [traditionSearch, setTraditionSearch] = useState<string>('');

  // Hotels state
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [loadingHotels, setLoadingHotels] = useState<boolean>(true);
  const [hotelModalOpen, setHotelModalOpen] = useState<boolean>(false);
  const [editingHotel, setEditingHotel] = useState<HotelItem | null>(null);
  const [submittingHotelId, setSubmittingHotelId] = useState<string | null>(null);
  const [submittingHotelForm, setSubmittingHotelForm] = useState<boolean>(false);

  // Rooms & Inventory state
  const [selectedHotelForRooms, setSelectedHotelForRooms] = useState<HotelItem | null>(null);
  const [hotelRooms, setHotelRooms] = useState<HotelRoomTypeItem[]>([]);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(false);
  const [roomModalOpen, setRoomModalOpen] = useState<boolean>(false);
  const [editingRoom, setEditingRoom] = useState<HotelRoomTypeItem | null>(null);
  const [submittingRoomForm, setSubmittingRoomForm] = useState<boolean>(false);
  const [inventoryModalOpen, setInventoryModalOpen] = useState<boolean>(false);
  const [editingInventoryRoom, setEditingInventoryRoom] = useState<HotelRoomTypeItem | null>(null);
  const [submittingInventoryForm, setSubmittingInventoryForm] = useState<boolean>(false);

  // Room Form State
  const [roomFormData, setRoomFormData] = useState({
    name: '',
    description: '',
    maxOccupancy: 2,
    bedConfiguration: '1 King Bed',
    roomSize: '350',
    amenities: 'Air Conditioning, Free WiFi, Private Bathroom, Hot Shower',
    baseInventoryUnits: 5,
    accessible: false,
    isActive: true,
  });

  // Inventory Form State
  const [inventoryMode, setInventoryMode] = useState<'baseline' | 'single' | 'range'>('baseline');
  const [inventoryFormData, setInventoryFormData] = useState({
    totalUnits: 5,
    blockedUnits: 0,
    inventoryDate: '',
    startDate: '',
    endDate: '',
  });

  // Rate Plans State
  const [ratePlanModalOpen, setRatePlanModalOpen] = useState<boolean>(false);
  const [selectedRoomForRatePlans, setSelectedRoomForRatePlans] = useState<HotelRoomTypeItem | null>(null);
  const [ratePlans, setRatePlans] = useState<HotelRatePlanItem[]>([]);
  const [loadingRatePlans, setLoadingRatePlans] = useState<boolean>(false);
  const [ratePlanFormModalOpen, setRatePlanFormModalOpen] = useState<boolean>(false);
  const [editingRatePlan, setEditingRatePlan] = useState<HotelRatePlanItem | null>(null);
  const [submittingRatePlanForm, setSubmittingRatePlanForm] = useState<boolean>(false);

  // Partner Hotel Bookings State (Phase 22.6)
  const [partnerBookingsModalOpen, setPartnerBookingsModalOpen] = useState<boolean>(false);
  const [selectedHotelForBookings, setSelectedHotelForBookings] = useState<HotelItem | null>(null);
  const [partnerBookingsList, setPartnerBookingsList] = useState<HotelBookingDto[]>([]);
  const [loadingPartnerBookings, setLoadingPartnerBookings] = useState<boolean>(false);

  const handleOpenPartnerBookings = async (h: HotelItem) => {
    if (!token) return;
    setSelectedHotelForBookings(h);
    setPartnerBookingsModalOpen(true);
    setLoadingPartnerBookings(true);
    try {
      const res = await getPartnerHotelBookings(h.id, token);
      if (res.success && res.data) {
        setPartnerBookingsList(res.data);
      }
    } catch (err: unknown) {
      console.error('Failed to load partner hotel bookings:', err);
    } finally {
      setLoadingPartnerBookings(false);
    }
  };

  // Rate Plan Form Data
  const [ratePlanFormData, setRatePlanFormData] = useState({
    planName: 'Breakfast Included',
    mealPlan: 'CP' as 'EP' | 'CP' | 'MAP' | 'AP',
    description: '',
    basePrice: 3500,
    currency: 'INR',
    priceUnit: 'NIGHT',
    validFrom: '',
    validTo: '',
    cancellationPolicy: 'FREE_CANCELLATION' as 'FREE_CANCELLATION' | 'NON_REFUNDABLE' | 'PARTIAL_REFUND' | 'CUSTOM',
    cancellationDeadlineHours: 24,
    taxesIncluded: true,
    feesIncluded: true,
    status: 'ACTIVE' as 'DRAFT' | 'ACTIVE',
  });

  // Experience Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Heritage Tour',
    culturalTraditionId: '',
    description: '',
    durationHours: 3.0,
    pricePerPerson: 900,
    maxGroupSize: 8,
    includedItems: 'Master artisan instruction, Materials, Refreshments',
    requirements: 'Open for all enthusiasts',
    languages: 'English, Hindi',
    coverImageUrl: '',
  });

  // Hotel Form State
  const [hotelFormData, setHotelFormData] = useState({
    name: '',
    category: 'HOMESTAY',
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
    contactPhone: '',
    contactEmail: '',
    officialWebsite: '',
    checkInTime: '12:00 PM',
    checkOutTime: '11:00 AM',
    amenities: 'WiFi, Hot Water, Room Service, Air Conditioning',
    imageUrl: '',
    description: '',
  });

  const loadExperiences = useCallback(async () => {
    if (!token) return;
    setLoadingExps(true);
    try {
      const res = await getPartnerExperiences(token);
      if (res.success && res.data) {
        setExperiences(res.data);
      }
    } catch (err: unknown) {
      console.error('Error fetching experiences:', err);
    } finally {
      setLoadingExps(false);
    }
  }, [token]);

  const loadHotels = useCallback(async () => {
    if (!token) return;
    setLoadingHotels(true);
    try {
      const res = await getMyPartnerHotels(token);
      if (res.success && res.data) {
        setHotels(res.data);
      }
    } catch (err: unknown) {
      console.error('Error fetching partner hotels:', err);
    } finally {
      setLoadingHotels(false);
    }
  }, [token]);

  const loadTraditions = useCallback(async () => {
    try {
      const res = await getCulturalTraditions({ page: 0, size: 100 });
      if (res.success && res.data && res.data.content) {
        setTraditions(res.data.content);
      }
    } catch (err: unknown) {
      console.error('Error loading cultural traditions for selector:', err);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && role === 'PARTNER') {
      loadExperiences();
      loadHotels();
      loadTraditions();
    }
  }, [isAuthenticated, role, loadExperiences, loadHotels, loadTraditions]);

  // Hotel Handlers
  const handleOpenCreateHotel = () => {
    setEditingHotel(null);
    setHotelFormData({
      name: '',
      category: partnerDetails?.partnerSubtype === 'HOMESTAY' ? 'HOMESTAY' : 'HOTEL',
      address: '',
      city: partnerDetails?.city || '',
      state: partnerDetails?.state || '',
      pincode: '',
      latitude: '',
      longitude: '',
      contactPhone: user?.phone || '',
      contactEmail: user?.email || '',
      officialWebsite: '',
      checkInTime: '12:00 PM',
      checkOutTime: '11:00 AM',
      amenities: 'Free WiFi, Hot Water, Daily Housekeeping, Air Conditioning',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
      description: '',
    });
    setActionError(null);
    setActionSuccess(null);
    setHotelModalOpen(true);
  };

  const handleOpenEditHotel = (h: HotelItem) => {
    setEditingHotel(h);
    setHotelFormData({
      name: h.hotelName,
      category: h.category || 'HOTEL',
      address: h.address || '',
      city: h.cityName || h.cityId || '',
      state: h.stateName || h.stateId || '',
      pincode: '',
      latitude: h.latitude != null ? String(h.latitude) : '',
      longitude: h.longitude != null ? String(h.longitude) : '',
      contactPhone: h.contactPhone || '',
      contactEmail: h.contactEmail || '',
      officialWebsite: h.officialWebsite || '',
      checkInTime: h.checkInTime || '12:00 PM',
      checkOutTime: h.checkOutTime || '11:00 AM',
      amenities: h.amenities ? h.amenities.join(', ') : '',
      imageUrl: '',
      description: '',
    });
    setActionError(null);
    setActionSuccess(null);
    setHotelModalOpen(true);
  };

  const handleSubmitHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmittingHotelForm(true);
    setActionError(null);
    setActionSuccess(null);

    if (!hotelFormData.name.trim()) {
      setActionError('Property name is required.');
      setSubmittingHotelForm(false);
      return;
    }
    if (!hotelFormData.address.trim()) {
      setActionError('Property address is required.');
      setSubmittingHotelForm(false);
      return;
    }
    if (!hotelFormData.city.trim()) {
      setActionError('City is required.');
      setSubmittingHotelForm(false);
      return;
    }
    if (!hotelFormData.state.trim()) {
      setActionError('State is required.');
      setSubmittingHotelForm(false);
      return;
    }

    const payload: CreateHotelRequest = {
      hotelName: hotelFormData.name.trim(),
      cityId: hotelFormData.city.trim(),
      category: hotelFormData.category,
      pricePerNight: 1500,
      address: hotelFormData.address.trim(),
      latitude: hotelFormData.latitude ? parseFloat(hotelFormData.latitude) : undefined,
      longitude: hotelFormData.longitude ? parseFloat(hotelFormData.longitude) : undefined,
      contactPhone: hotelFormData.contactPhone.trim() || undefined,
      contactEmail: hotelFormData.contactEmail.trim() || undefined,
      officialWebsite: hotelFormData.officialWebsite.trim() || undefined,
      checkInTime: hotelFormData.checkInTime.trim() || undefined,
      checkOutTime: hotelFormData.checkOutTime.trim() || undefined,
      amenities: hotelFormData.amenities ? hotelFormData.amenities.split(',').map((s) => s.trim()).filter(Boolean) : [],
    };

    try {
      if (editingHotel) {
        const res = await updatePartnerHotel(editingHotel.id, payload, token);
        if (res.success && res.data) {
          setHotels((prev) => prev.map((h) => (h.id === editingHotel.id ? res.data : h)));
          setActionSuccess(
            editingHotel.verificationStatus === 'VERIFIED'
              ? 'Property updated. Since core details were modified, it has been resubmitted for verification.'
              : 'Property details updated successfully.'
          );
        }
      } else {
        const res = await createPartnerHotel(payload, token);
        if (res.success && res.data) {
          setHotels((prev) => [res.data, ...prev]);
          setActionSuccess('Property registered successfully! Submit it for verification when ready.');
        }
      }
      setHotelModalOpen(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save property';
      setActionError(errorMsg);
    } finally {
      setSubmittingHotelForm(false);
    }
  };

  const handleSubmitHotelForVerification = async (id: string) => {
    if (!token) return;
    setSubmittingHotelId(id);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await submitPartnerHotel(id, token);
      if (res.success && res.data) {
        setHotels((prev) => prev.map((h) => (h.id === id ? res.data : h)));
        setActionSuccess('Property submitted for official YatraSetu verification review.');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit property for verification';
      setActionError(errorMsg);
    } finally {
      setSubmittingHotelId(null);
    }
  };

  const handleDeleteHotel = async (id: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to remove this property listing?')) return;
    try {
      await deletePartnerHotel(id, token);
      setHotels((prev) => prev.filter((h) => h.id !== id));
      setActionSuccess('Property listing removed successfully.');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to remove property';
      alert(errorMsg);
    }
  };

  // Rooms & Inventory Handlers
  const handleOpenHotelRooms = async (hotel: HotelItem) => {
    if (!token) return;
    setSelectedHotelForRooms(hotel);
    setLoadingRooms(true);
    setActionError(null);
    try {
      const res = await getPartnerHotelRooms(hotel.id, token);
      if (res.success && res.data) {
        setHotelRooms(res.data);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load room types';
      setActionError(errorMsg);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleOpenCreateRoom = () => {
    setEditingRoom(null);
    setRoomFormData({
      name: '',
      description: '',
      maxOccupancy: 2,
      bedConfiguration: '1 King Bed',
      roomSize: '350',
      amenities: 'Air Conditioning, Free WiFi, Private Bathroom, Hot Shower',
      baseInventoryUnits: 5,
      accessible: false,
      isActive: true,
    });
    setActionError(null);
    setRoomModalOpen(true);
  };

  const handleOpenEditRoom = (room: HotelRoomTypeItem) => {
    setEditingRoom(room);
    setRoomFormData({
      name: room.roomTypeName,
      description: room.description || '',
      maxOccupancy: room.maxOccupancy,
      bedConfiguration: room.bedConfiguration || '1 King Bed',
      roomSize: room.roomSizeSqft ? String(room.roomSizeSqft) : '',
      amenities: room.amenities ? room.amenities.join(', ') : '',
      baseInventoryUnits: room.baseInventoryUnits,
      accessible: Boolean(room.isAccessible),
      isActive: Boolean(room.isActive),
    });
    setActionError(null);
    setRoomModalOpen(true);
  };

  const handleSubmitRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedHotelForRooms) return;
    setSubmittingRoomForm(true);
    setActionError(null);

    if (!roomFormData.name.trim()) {
      setActionError('Room type name is required.');
      setSubmittingRoomForm(false);
      return;
    }
    if (Number(roomFormData.maxOccupancy) < 1) {
      setActionError('Maximum occupancy must be at least 1 guest.');
      setSubmittingRoomForm(false);
      return;
    }
    if (Number(roomFormData.baseInventoryUnits) < 0) {
      setActionError('Physical inventory units cannot be negative.');
      setSubmittingRoomForm(false);
      return;
    }

    const payload: CreateRoomTypeRequest = {
      roomTypeName: roomFormData.name.trim(),
      description: roomFormData.description.trim() || undefined,
      maxOccupancy: Number(roomFormData.maxOccupancy),
      bedConfiguration: roomFormData.bedConfiguration.trim() || undefined,
      roomSizeSqft: roomFormData.roomSize ? parseInt(roomFormData.roomSize, 10) : undefined,
      amenities: roomFormData.amenities ? roomFormData.amenities.split(',').map((s) => s.trim()).filter(Boolean) : [],
      baseInventoryUnits: Number(roomFormData.baseInventoryUnits),
      isAccessible: roomFormData.accessible,
      isActive: roomFormData.isActive,
    };

    try {
      if (editingRoom) {
        const res = await updatePartnerHotelRoom(selectedHotelForRooms.id, editingRoom.id, payload, token);
        if (res.success && res.data) {
          setHotelRooms((prev) => prev.map((r) => (r.id === editingRoom.id ? res.data : r)));
          setActionSuccess('Room type configuration updated.');
        }
      } else {
        const res = await createPartnerHotelRoom(selectedHotelForRooms.id, payload, token);
        if (res.success && res.data) {
          setHotelRooms((prev) => [...prev, res.data]);
          setActionSuccess('New room type and physical inventory registered.');
        }
      }
      setRoomModalOpen(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save room type';
      setActionError(errorMsg);
    } finally {
      setSubmittingRoomForm(false);
    }
  };

  const handleToggleRoomActive = async (room: HotelRoomTypeItem) => {
    if (!token || !selectedHotelForRooms) return;
    try {
      const res = await updatePartnerHotelRoom(
        selectedHotelForRooms.id,
        room.id,
        { isActive: !room.isActive },
        token
      );
      if (res.success && res.data) {
        setHotelRooms((prev) => prev.map((r) => (r.id === room.id ? res.data : r)));
        setActionSuccess(`Room type ${!room.isActive ? 'activated' : 'deactivated'}.`);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update room state';
      alert(errorMsg);
    }
  };

  const handleDeleteRoom = async (room: HotelRoomTypeItem) => {
    if (!token || !selectedHotelForRooms) return;
    if (!confirm(`Are you sure you want to remove the room type "${room.roomTypeName}"? Associated physical inventory records will be removed.`)) return;
    try {
      await deletePartnerHotelRoom(selectedHotelForRooms.id, room.id, token);
      setHotelRooms((prev) => prev.filter((r) => r.id !== room.id));
      setActionSuccess('Room type removed successfully.');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to remove room type';
      alert(errorMsg);
    }
  };

  const handleOpenManageInventory = (room: HotelRoomTypeItem) => {
    setEditingInventoryRoom(room);
    setInventoryMode('baseline');
    setInventoryFormData({
      totalUnits: room.baseInventoryUnits,
      blockedUnits: 0,
      inventoryDate: '',
      startDate: '',
      endDate: '',
    });
    setActionError(null);
    setInventoryModalOpen(true);
  };

  const handleSubmitInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedHotelForRooms || !editingInventoryRoom) return;
    setSubmittingInventoryForm(true);
    setActionError(null);

    const total = Number(inventoryFormData.totalUnits);
    const blocked = Number(inventoryFormData.blockedUnits);

    if (total < 0) {
      setActionError('Total units cannot be negative.');
      setSubmittingInventoryForm(false);
      return;
    }
    if (blocked < 0) {
      setActionError('Blocked units cannot be negative.');
      setSubmittingInventoryForm(false);
      return;
    }
    if (blocked > total) {
      setActionError('Blocked units cannot exceed total inventory capacity.');
      setSubmittingInventoryForm(false);
      return;
    }

    try {
      if (inventoryMode === 'range') {
        if (!inventoryFormData.startDate || !inventoryFormData.endDate) {
          setActionError('Start date and end date are required for date range update.');
          setSubmittingInventoryForm(false);
          return;
        }
        if (inventoryFormData.startDate > inventoryFormData.endDate) {
          setActionError('Start date must be before or equal to end date.');
          setSubmittingInventoryForm(false);
          return;
        }

        const payload: BulkInventoryUpdateRequest = {
          startDate: inventoryFormData.startDate,
          endDate: inventoryFormData.endDate,
          totalUnits: total,
          blockedUnits: blocked,
        };

        const res = await updatePartnerBulkRoomInventory(
          selectedHotelForRooms.id,
          editingInventoryRoom.id,
          payload,
          token
        );
        if (res.success) {
          setActionSuccess(`Date-range physical inventory updated across ${res.data?.length || 0} dates.`);
          setInventoryModalOpen(false);
        }
      } else {
        const payload: UpdateInventoryRequest = {
          totalUnits: total,
          blockedUnits: blocked,
          inventoryDate: inventoryMode === 'single' ? (inventoryFormData.inventoryDate.trim() || undefined) : undefined,
        };

        const res = await updatePartnerRoomInventory(
          selectedHotelForRooms.id,
          editingInventoryRoom.id,
          payload,
          token
        );
        if (res.success) {
          // Also update room list's baseInventoryUnits if baseline was edited
          if (inventoryMode === 'baseline') {
            setHotelRooms((prev) =>
              prev.map((r) => (r.id === editingInventoryRoom.id ? { ...r, baseInventoryUnits: total } : r))
            );
          }
          setActionSuccess(
            inventoryMode === 'single'
              ? `Date-specific physical inventory override set for ${inventoryFormData.inventoryDate}.`
              : 'Baseline physical inventory capacity updated successfully.'
          );
          setInventoryModalOpen(false);
        }
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update physical inventory';
      setActionError(errorMsg);
    } finally {
      setSubmittingInventoryForm(false);
    }
  };

  // Rate Plans Handlers
  const handleOpenRatePlans = async (room: HotelRoomTypeItem) => {
    if (!token || !selectedHotelForRooms) return;
    setSelectedRoomForRatePlans(room);
    setRatePlanModalOpen(true);
    setLoadingRatePlans(true);
    setActionError(null);

    try {
      const res = await getPartnerRatePlans(selectedHotelForRooms.id, room.id, token);
      if (res.success && res.data) {
        setRatePlans(res.data);
      } else {
        setRatePlans([]);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load rate plans';
      setActionError(errorMsg);
      setRatePlans([]);
    } finally {
      setLoadingRatePlans(false);
    }
  };

  const handleOpenCreateRatePlan = () => {
    setEditingRatePlan(null);
    setRatePlanFormData({
      planName: 'Breakfast Included',
      mealPlan: 'CP',
      description: 'Standard plan with freshly prepared morning breakfast included.',
      basePrice: 3500,
      currency: 'INR',
      priceUnit: 'NIGHT',
      validFrom: '',
      validTo: '',
      cancellationPolicy: 'FREE_CANCELLATION',
      cancellationDeadlineHours: 24,
      taxesIncluded: true,
      feesIncluded: true,
      status: 'ACTIVE',
    });
    setActionError(null);
    setRatePlanFormModalOpen(true);
  };

  const handleOpenEditRatePlan = (plan: HotelRatePlanItem) => {
    setEditingRatePlan(plan);
    setRatePlanFormData({
      planName: plan.planName,
      mealPlan: plan.mealPlan,
      description: plan.description || '',
      basePrice: plan.basePrice,
      currency: plan.currency || 'INR',
      priceUnit: plan.priceUnit || 'NIGHT',
      validFrom: plan.validFrom || '',
      validTo: plan.validTo || '',
      cancellationPolicy: plan.cancellationPolicy,
      cancellationDeadlineHours: plan.cancellationDeadlineHours,
      taxesIncluded: plan.taxesIncluded,
      feesIncluded: plan.feesIncluded,
      status: plan.status === 'INACTIVE' ? 'DRAFT' : plan.status,
    });
    setActionError(null);
    setRatePlanFormModalOpen(true);
  };

  const handleSubmitRatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedHotelForRooms || !selectedRoomForRatePlans) return;
    setSubmittingRatePlanForm(true);
    setActionError(null);

    if (!ratePlanFormData.planName.trim()) {
      setActionError('Rate plan name is required.');
      setSubmittingRatePlanForm(false);
      return;
    }

    if (Number(ratePlanFormData.basePrice) < 0) {
      setActionError('Base price cannot be negative.');
      setSubmittingRatePlanForm(false);
      return;
    }

    if (ratePlanFormData.validFrom && ratePlanFormData.validTo && ratePlanFormData.validTo < ratePlanFormData.validFrom) {
      setActionError('Validity end date cannot be earlier than start date.');
      setSubmittingRatePlanForm(false);
      return;
    }

    try {
      if (editingRatePlan) {
        const updatePayload: UpdateRatePlanRequest = {
          planName: ratePlanFormData.planName.trim(),
          mealPlan: ratePlanFormData.mealPlan,
          description: ratePlanFormData.description.trim() || undefined,
          basePrice: Number(ratePlanFormData.basePrice),
          currency: ratePlanFormData.currency,
          priceUnit: ratePlanFormData.priceUnit,
          validFrom: ratePlanFormData.validFrom.trim() || undefined,
          validTo: ratePlanFormData.validTo.trim() || undefined,
          cancellationPolicy: ratePlanFormData.cancellationPolicy,
          cancellationDeadlineHours: Number(ratePlanFormData.cancellationDeadlineHours),
          taxesIncluded: ratePlanFormData.taxesIncluded,
          feesIncluded: ratePlanFormData.feesIncluded,
          status: ratePlanFormData.status,
        };
        const res = await updatePartnerRatePlan(
          selectedHotelForRooms.id,
          selectedRoomForRatePlans.id,
          editingRatePlan.id,
          updatePayload,
          token
        );
        if (res.success && res.data) {
          setRatePlans((prev) => prev.map((p) => (p.id === editingRatePlan.id ? res.data : p)));
          setActionSuccess('Rate plan updated successfully.');
          setRatePlanFormModalOpen(false);
        }
      } else {
        const createPayload: CreateRatePlanRequest = {
          planName: ratePlanFormData.planName.trim(),
          mealPlan: ratePlanFormData.mealPlan,
          description: ratePlanFormData.description.trim() || undefined,
          basePrice: Number(ratePlanFormData.basePrice),
          currency: ratePlanFormData.currency,
          priceUnit: ratePlanFormData.priceUnit,
          validFrom: ratePlanFormData.validFrom.trim() || undefined,
          validTo: ratePlanFormData.validTo.trim() || undefined,
          cancellationPolicy: ratePlanFormData.cancellationPolicy,
          cancellationDeadlineHours: Number(ratePlanFormData.cancellationDeadlineHours),
          taxesIncluded: ratePlanFormData.taxesIncluded,
          feesIncluded: ratePlanFormData.feesIncluded,
          status: ratePlanFormData.status,
        };
        const res = await createPartnerRatePlan(
          selectedHotelForRooms.id,
          selectedRoomForRatePlans.id,
          createPayload,
          token
        );
        if (res.success && res.data) {
          setRatePlans((prev) => [res.data, ...prev]);
          setActionSuccess('New rate plan created successfully.');
          setRatePlanFormModalOpen(false);
        }
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save rate plan';
      setActionError(errorMsg);
    } finally {
      setSubmittingRatePlanForm(false);
    }
  };

  const handleToggleRatePlanStatus = async (plan: HotelRatePlanItem) => {
    if (!token || !selectedHotelForRooms || !selectedRoomForRatePlans) return;
    try {
      if (plan.status === 'ACTIVE') {
        const res = await deactivatePartnerRatePlan(selectedHotelForRooms.id, selectedRoomForRatePlans.id, plan.id, token);
        if (res.success && res.data) {
          setRatePlans((prev) => prev.map((p) => (p.id === plan.id ? res.data : p)));
          setActionSuccess('Rate plan deactivated.');
        }
      } else {
        const res = await activatePartnerRatePlan(selectedHotelForRooms.id, selectedRoomForRatePlans.id, plan.id, token);
        if (res.success && res.data) {
          setRatePlans((prev) => prev.map((p) => (p.id === plan.id ? res.data : p)));
          setActionSuccess('Rate plan activated.');
        }
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update rate plan status';
      alert(errorMsg);
    }
  };

  const handleDeleteRatePlan = async (plan: HotelRatePlanItem) => {
    if (!token || !selectedHotelForRooms || !selectedRoomForRatePlans) return;
    if (!confirm(`Are you sure you want to delete rate plan "${plan.planName}"?`)) return;

    try {
      const res = await deletePartnerRatePlan(selectedHotelForRooms.id, selectedRoomForRatePlans.id, plan.id, token);
      if (res.success) {
        setRatePlans((prev) => prev.filter((p) => p.id !== plan.id));
        setActionSuccess('Rate plan deleted successfully.');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete rate plan';
      alert(errorMsg);
    }
  };

  // Experience Handlers
  const handleOpenCreate = (initialCategory = 'Heritage Tour') => {
    setEditingExp(null);
    const isCultural = CULTURAL_CATEGORIES.includes(initialCategory);
    setFormData({
      title: '',
      category: initialCategory,
      culturalTraditionId: '',
      description: '',
      durationHours: isCultural ? 3.0 : 2.5,
      pricePerPerson: isCultural ? 1200 : 750,
      maxGroupSize: isCultural ? 6 : 10,
      includedItems: isCultural
        ? 'Master artisan demonstration, Raw materials & tools, Finished craft item, Traditional chai'
        : 'Local expert guide, Walking map, Refreshments',
      requirements: 'Open for all skill levels',
      languages: 'English, Hindi',
      coverImageUrl: isCultural
        ? 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=80'
        : 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&q=80',
    });
    setTraditionSearch('');
    setActionError(null);
    setActionSuccess(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (exp: ExperienceItem) => {
    setEditingExp(exp);
    setFormData({
      title: exp.title,
      category: exp.category,
      culturalTraditionId: exp.culturalTraditionId || '',
      description: exp.description.replace(/^\[SAMPLE\]\s*/i, ''),
      durationHours: exp.durationHours,
      pricePerPerson: exp.pricePerPerson,
      maxGroupSize: exp.maxGroupSize,
      includedItems: exp.includedItems ? exp.includedItems.join(', ') : '',
      requirements: exp.requirements || '',
      languages: exp.languages ? exp.languages.join(', ') : 'English, Hindi',
      coverImageUrl: exp.coverImageUrl || '',
    });
    setTraditionSearch('');
    setActionError(null);
    setActionSuccess(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await deletePartnerExperience(id, token || undefined);
      setExperiences((prev) => prev.filter((e) => e.id !== id));
      setActionSuccess('Experience deleted successfully.');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete listing';
      alert(errorMsg);
    }
  };

  const handleSubmitForReview = async (id: string) => {
    setSubmittingExpId(id);
    setActionError(null);
    try {
      const res = await submitPartnerExperienceForReview(id, token || undefined);
      if (res.success && res.data) {
        setExperiences((prev) => prev.map((e) => (e.id === id ? res.data : e)));
        setActionSuccess('Experience submitted for official verification review.');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit experience for review';
      setActionError(errorMsg);
    } finally {
      setSubmittingExpId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    // Validation
    if (!formData.title.trim()) {
      setActionError('Experience title is required.');
      setSubmitting(false);
      return;
    }
    if (!formData.description.trim()) {
      setActionError('Experience description is required.');
      setSubmitting(false);
      return;
    }
    if (Number(formData.durationHours) <= 0) {
      setActionError('Duration must be greater than 0 hours.');
      setSubmitting(false);
      return;
    }
    if (Number(formData.pricePerPerson) < 0) {
      setActionError('Price per person cannot be negative.');
      setSubmitting(false);
      return;
    }
    if (Number(formData.maxGroupSize) <= 0) {
      setActionError('Maximum group size must be at least 1.');
      setSubmitting(false);
      return;
    }

    const isCultural = CULTURAL_CATEGORIES.includes(formData.category) || !!formData.culturalTraditionId;

    const payload: Partial<ExperienceItem> = {
      title: formData.title.trim(),
      category: formData.category,
      culturalTraditionId: isCultural && formData.culturalTraditionId ? formData.culturalTraditionId : undefined,
      description: formData.description.trim(),
      durationHours: Number(formData.durationHours),
      pricePerPerson: Number(formData.pricePerPerson),
      maxGroupSize: Number(formData.maxGroupSize),
      includedItems: formData.includedItems.split(',').map((s) => s.trim()).filter(Boolean),
      requirements: formData.requirements.trim() || undefined,
      languages: formData.languages.split(',').map((s) => s.trim()).filter(Boolean),
      coverImageUrl: formData.coverImageUrl.trim() || undefined,
    };

    try {
      if (editingExp) {
        const res = await updatePartnerExperience(editingExp.id, payload, token || undefined);
        if (res.success && res.data) {
          setExperiences((prev) => prev.map((e) => (e.id === editingExp.id ? res.data : e)));
          setActionSuccess('Experience updated successfully.');
        }
      } else {
        const res = await createPartnerExperience(payload, token || undefined);
        if (res.success && res.data) {
          setExperiences((prev) => [res.data, ...prev]);
          setActionSuccess('New experience listing created. Submit it for verification when ready.');
        }
      }
      setModalOpen(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save listing';
      setActionError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const culturalListings = useMemo(() => {
    return experiences.filter(
      (e) =>
        Boolean(e.culturalTraditionId) ||
        CULTURAL_CATEGORIES.includes(e.category) ||
        e.category.toLowerCase().includes('craft') ||
        e.category.toLowerCase().includes('art') ||
        e.category.toLowerCase().includes('culture')
    );
  }, [experiences]);

  const regularListings = useMemo(() => {
    return experiences.filter((e) => !culturalListings.includes(e));
  }, [experiences, culturalListings]);

  // Current tab active list
  const currentTabListings = activeTab === 'CULTURE' ? culturalListings : regularListings;

  // Filtered by lifecycle status
  const displayedListings = useMemo(() => {
    if (statusFilter === 'ALL') return currentTabListings;
    if (statusFilter === 'DRAFT') {
      return currentTabListings.filter((e) => e.status === 'DRAFT' || e.verificationStatus === 'UNVERIFIED');
    }
    if (statusFilter === 'PENDING_REVIEW') {
      return currentTabListings.filter((e) => e.verificationStatus === 'PENDING_REVIEW' || e.status === 'SUBMITTED');
    }
    if (statusFilter === 'PUBLISHED') {
      return currentTabListings.filter((e) => e.verificationStatus === 'VERIFIED' || e.status === 'PUBLISHED');
    }
    if (statusFilter === 'REJECTED') {
      return currentTabListings.filter((e) => e.verificationStatus === 'REJECTED' || e.status === 'REJECTED');
    }
    return currentTabListings;
  }, [currentTabListings, statusFilter]);

  const displayedHotels = useMemo(() => {
    if (statusFilter === 'ALL') return hotels;
    if (statusFilter === 'DRAFT') {
      return hotels.filter((h) => !h.verificationStatus || h.verificationStatus === 'UNVERIFIED');
    }
    if (statusFilter === 'PENDING_REVIEW') {
      return hotels.filter((h) => h.verificationStatus === 'PENDING_REVIEW');
    }
    if (statusFilter === 'PUBLISHED') {
      return hotels.filter((h) => h.verificationStatus === 'VERIFIED');
    }
    if (statusFilter === 'REJECTED') {
      return hotels.filter((h) => h.verificationStatus === 'REJECTED');
    }
    return hotels;
  }, [hotels, statusFilter]);

  // Filtered traditions for modal search
  const filteredTraditions = useMemo(() => {
    if (!traditionSearch.trim()) return traditions;
    const q = traditionSearch.toLowerCase();
    return traditions.filter(
      (t) =>
        t.traditionName.toLowerCase().includes(q) ||
        (t.craftType && t.craftType.toLowerCase().includes(q)) ||
        (t.stateName && t.stateName.toLowerCase().includes(q)) ||
        (t.cityName && t.cityName.toLowerCase().includes(q)) ||
        (t.primaryProducingCluster && t.primaryProducingCluster.toLowerCase().includes(q))
    );
  }, [traditions, traditionSearch]);

  const selectedTraditionObj = useMemo(() => {
    return traditions.find((t) => t.id === formData.culturalTraditionId);
  }, [traditions, formData.culturalTraditionId]);

  // Role Gate
  if (!isAuthenticated || role !== 'PARTNER') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="text-center space-y-4 max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#171717]">Partner Access Required</h2>
          <p className="text-xs text-[#64748B] leading-relaxed">
            This dashboard is dedicated to verified local tourism partners, hoteliers, homestay operators, guides, and cultural artisans.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => openAuthModal('PARTNER')}
              className="w-full py-2.5 px-4 bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-bold rounded-xl shadow transition-colors"
            >
              Sign In as Local Partner
            </button>
            <Link
              href="/explore"
              className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-[#171717] text-xs font-semibold rounded-xl transition-colors text-center"
            >
              Return to Public Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const vStatus = partnerDetails?.verificationStatus || 'PENDING';

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner: Verification Status */}
      {vStatus === 'PENDING' ? (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-amber-950">Partner Account Verification in Progress</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-extrabold uppercase tracking-wide">
                  Pending Review
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Your partner profile has been submitted to local authorities. You can register properties, cultural workshops, and tour listings while account verification is underway.
              </p>
            </div>
          </div>
          <Link
            href="/partner/profile"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors flex-shrink-0"
          >
            Review Profile
          </Link>
        </div>
      ) : vStatus === 'APPROVED' ? (
        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-emerald-950">Verified Partner Account</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-extrabold uppercase">
                Verified
              </span>
            </div>
            <p className="text-xs text-emerald-800 mt-0.5">
              Your profile carries the official YatraSetu verified trust seal across destination listings.
            </p>
          </div>
        </div>
      ) : null}

      {/* Global Action Feedback Alert */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-950 font-bold">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Action Error Alert */}
      {actionError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-700 hover:text-red-950 font-bold">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight">
            {partnerDetails?.businessName || user?.fullName}&apos;s Partner Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] flex items-center gap-2 mt-1">
            <span className="font-semibold text-[#0F766E]">{partnerDetails?.partnerSubtype || 'HOTEL / LOCAL HOST'}</span>
            {partnerDetails?.city && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {partnerDetails.city}, {partnerDetails.state}
                </span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleOpenCreateHotel}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Building2 className="w-4 h-4" />
            Register Property
          </button>
          <button
            onClick={() => handleOpenCreate('Handicraft / Artisan')}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Palette className="w-4 h-4" />
            Add Cultural Experience
          </button>
          <button
            onClick={() => handleOpenCreate('Heritage Tour')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Create Tour
          </button>
          <Link
            href="/partner/profile"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#171717] text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Briefcase className="w-4 h-4" />
            Profile
          </Link>
        </div>
      </div>

      {/* Metric Cards - Real Data Counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            My Properties &amp; Stays
          </span>
          <div className="text-2xl font-extrabold text-indigo-700">{hotels.length}</div>
          <span className="text-[10px] text-slate-500 font-medium">
            {hotels.filter((h) => h.verificationStatus === 'VERIFIED').length} Verified • {hotels.filter((h) => h.verificationStatus === 'PENDING_REVIEW').length} In Review
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Verified Partner Stays
          </span>
          <div className="text-2xl font-extrabold text-emerald-600">
            {hotels.filter((h) => h.verificationStatus === 'VERIFIED').length}
          </div>
          <span className="text-[10px] text-emerald-700 font-medium">YatraSetu Trust Badge</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Experiences &amp; Tours
          </span>
          <div className="text-2xl font-extrabold text-teal-700">{experiences.length}</div>
          <span className="text-[10px] text-teal-700 font-medium">
            {culturalListings.length} Cultural • {regularListings.length} Tours
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Pending Verifications
          </span>
          <div className="text-2xl font-extrabold text-amber-600">
            {hotels.filter((h) => h.verificationStatus === 'PENDING_REVIEW').length +
              experiences.filter((e) => e.verificationStatus === 'PENDING_REVIEW').length}
          </div>
          <span className="text-[10px] text-amber-700">Awaiting Authority Review</span>
        </div>
      </div>

      {/* Tabs: Hotels / Stays vs Tours & Experiences vs Local Culture & Artisans */}
      <div className="flex items-center space-x-3 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('HOTELS');
            setStatusFilter('ALL');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 flex-shrink-0 ${
            activeTab === 'HOTELS'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>My Properties &amp; Stays ({hotels.length})</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('EXPERIENCES');
            setStatusFilter('ALL');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 flex-shrink-0 ${
            activeTab === 'EXPERIENCES'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Tours &amp; Sightseeing ({regularListings.length})</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('CULTURE');
            setStatusFilter('ALL');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 flex-shrink-0 ${
            activeTab === 'CULTURE'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Culture &amp; Artisan Masterclasses ({culturalListings.length})</span>
        </button>
      </div>

      {/* Lifecycle Status Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[11px] font-semibold text-slate-400 mr-1">Status:</span>
        {(
          [
            {
              key: 'ALL',
              label: `All (${activeTab === 'HOTELS' ? hotels.length : currentTabListings.length})`,
            },
            {
              key: 'DRAFT',
              label: `Drafts (${
                activeTab === 'HOTELS'
                  ? hotels.filter((h) => !h.verificationStatus || h.verificationStatus === 'UNVERIFIED').length
                  : currentTabListings.filter((e) => e.status === 'DRAFT' || e.verificationStatus === 'UNVERIFIED').length
              })`,
            },
            {
              key: 'PENDING_REVIEW',
              label: `Under Review (${
                activeTab === 'HOTELS'
                  ? hotels.filter((h) => h.verificationStatus === 'PENDING_REVIEW').length
                  : currentTabListings.filter((e) => e.verificationStatus === 'PENDING_REVIEW').length
              })`,
            },
            {
              key: 'PUBLISHED',
              label: `Verified (${
                activeTab === 'HOTELS'
                  ? hotels.filter((h) => h.verificationStatus === 'VERIFIED').length
                  : currentTabListings.filter((e) => e.verificationStatus === 'VERIFIED').length
              })`,
            },
            {
              key: 'REJECTED',
              label: `Needs Revision (${
                activeTab === 'HOTELS'
                  ? hotels.filter((h) => h.verificationStatus === 'REJECTED').length
                  : currentTabListings.filter((e) => e.verificationStatus === 'REJECTED').length
              })`,
            },
          ] as const
        ).map((pill) => (
          <button
            key={pill.key}
            onClick={() => setStatusFilter(pill.key)}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              statusFilter === pill.key
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* HOTELS TAB CONTENT */}
      {activeTab === 'HOTELS' && (
        <div className="space-y-4">
          {loadingHotels ? (
            <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center text-xs text-slate-400 animate-pulse">
              Loading your properties...
            </div>
          ) : displayedHotels.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center space-y-3">
              <Building2 className="w-10 h-10 text-indigo-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No properties found in this filter</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Register your authentic hotel, boutique stay, heritage haveli, or homestay to receive the official YatraSetu Verified Partner trust seal.
              </p>
              <button
                onClick={handleOpenCreateHotel}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-colors"
              >
                Register First Property
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedHotels.map((h) => {
                const isVerified = h.verificationStatus === 'VERIFIED';
                const isPending = h.verificationStatus === 'PENDING_REVIEW';
                const isRejected = h.verificationStatus === 'REJECTED';
                const isSuspended = h.verificationStatus === 'SUSPENDED';
                const isDraft = !h.verificationStatus || h.verificationStatus === 'UNVERIFIED';

                return (
                  <div
                    key={h.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
                  >
                    <div>
                      {/* Top Row: Category + Verification Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="rounded-md px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                            {h.category?.replace(/_/g, ' ') || 'HOTEL'}
                          </span>

                          {/* Lifecycle Verification Status Badge */}
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 border border-emerald-200">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              YatraSetu Verified Partner
                            </span>
                          ) : isPending ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Under Review
                            </span>
                          ) : isRejected ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-extrabold text-rose-800 border border-rose-200">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              Needs Revision
                            </span>
                          ) : isSuspended ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-extrabold text-red-900 border border-red-300">
                              <AlertCircle className="w-3 h-3 text-red-700" />
                              Suspended
                            </span>
                          ) : (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                              Draft Property
                            </span>
                          )}
                        </div>

                        {/* Edit / Delete actions */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleOpenEditHotel(h)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Property"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteHotel(h.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Property"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-bold text-stone-900 mt-2.5 text-base leading-snug">
                        {h.hotelName}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{h.address ? `${h.address}, ` : ''}{h.cityName}, {h.stateName}</span>
                      </div>

                      {/* Verification Notes / Rejection Feedback if present */}
                      {h.rejectionReason && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-900 space-y-1">
                          <span className="font-bold flex items-center gap-1 text-rose-800">
                            <AlertCircle className="w-3 h-3 text-rose-600" /> Reviewer Feedback:
                          </span>
                          <p>{h.rejectionReason}</p>
                        </div>
                      )}

                      {h.verificationNotes && isVerified && (
                        <div className="mt-2 p-2 rounded-lg bg-emerald-50/70 border border-emerald-100 text-[11px] text-emerald-900">
                          <span className="font-bold text-emerald-800">Verification Audit: </span>
                          <span>{h.verificationNotes}</span>
                        </div>
                      )}

                      {/* Sensitive Edit Notice for Verified Stays */}
                      {isVerified && (
                        <div className="mt-2 p-2 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[10px] text-amber-900 flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                          <span>Editing core details (Name, Address, City, State) will reset status to Pending Review.</span>
                        </div>
                      )}

                      {/* Contact & Policy pills */}
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-stone-500">
                        {h.contactPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {h.contactPhone}
                          </span>
                        )}
                        {h.contactEmail && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {h.contactEmail}
                          </span>
                        )}
                        {h.officialWebsite && (
                          <a
                            href={h.officialWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-indigo-600 hover:underline"
                          >
                            <Globe className="w-3 h-3" />
                            Website
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Bottom Footer */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="text-[11px] text-slate-400">
                        {h.sourceType === 'PARTNER_SUBMITTED' ? 'Partner Registered Property' : 'Dataset Property'}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenHotelRooms(h)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-bold text-[11px] flex items-center gap-1.5 border border-indigo-200 transition-colors"
                        >
                          <BedDouble className="w-3.5 h-3.5 text-indigo-700" />
                          <span>Rooms &amp; Inventory</span>
                        </button>

                        <button
                          onClick={() => handleOpenPartnerBookings(h)}
                          className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-950 font-bold text-[11px] flex items-center gap-1.5 border border-teal-200 transition-colors"
                        >
                          <Calendar className="w-3.5 h-3.5 text-teal-700" />
                          <span>Bookings</span>
                        </button>

                        {(isDraft || isRejected) && (
                          <button
                            onClick={() => handleSubmitHotelForVerification(h.id)}
                            disabled={submittingHotelId === h.id}
                            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition-colors disabled:opacity-50"
                          >
                            <Send className="w-3 h-3" />
                            <span>{submittingHotelId === h.id ? 'Submitting...' : 'Submit for Verification'}</span>
                          </button>
                        )}

                        <Link
                          href={`/hotels/${h.id}`}
                          className="text-indigo-600 hover:text-indigo-700 font-semibold text-xs"
                        >
                          View Hotel Page →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* EXPERIENCES & CULTURE TAB CONTENT */}
      {activeTab !== 'HOTELS' && (
        <div className="space-y-4">
          {loadingExps ? (
            <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center text-xs text-slate-400 animate-pulse">
              Loading your listings...
            </div>
          ) : displayedListings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center space-y-3">
              {activeTab === 'CULTURE' ? (
                <Palette className="w-8 h-8 text-teal-600 mx-auto" />
              ) : (
                <Compass className="w-8 h-8 text-amber-500 mx-auto" />
              )}
              <h4 className="text-sm font-bold text-slate-800">
                {activeTab === 'CULTURE'
                  ? 'No cultural experiences in this filter'
                  : 'No tour experiences in this filter'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {activeTab === 'CULTURE'
                  ? 'Create a cultural experience linked to an authentic GI-tagged or state heritage tradition to share living culture with travelers.'
                  : 'Create your walking tour, heritage circuit, or nature exploration to receive traveler bookings.'}
              </p>
              <button
                onClick={() => handleOpenCreate(activeTab === 'CULTURE' ? 'Handicraft / Artisan' : 'Heritage Tour')}
                className={`px-4 py-2 text-xs font-bold rounded-xl shadow transition-colors ${
                  activeTab === 'CULTURE'
                    ? 'bg-teal-700 hover:bg-teal-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                }`}
              >
                {activeTab === 'CULTURE' ? 'Create Cultural Experience' : 'Create First Tour'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedListings.map((exp) => {
                const isVerified = exp.verificationStatus === 'VERIFIED';
                const isPending = exp.verificationStatus === 'PENDING_REVIEW' || exp.status === 'SUBMITTED';
                const isRejected = exp.verificationStatus === 'REJECTED' || exp.status === 'REJECTED';
                const isDraft = exp.status === 'DRAFT' || exp.verificationStatus === 'UNVERIFIED';

                return (
                  <div
                    key={exp.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
                  >
                    <div>
                      {/* Top Row: Category + Verification Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                              CULTURAL_CATEGORIES.includes(exp.category)
                                ? 'bg-teal-50 text-teal-800 border-teal-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {exp.category}
                          </span>

                          {/* Lifecycle Verification Status Badge */}
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 border border-emerald-200">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Verified Cultural Experience
                            </span>
                          ) : isPending ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Under Review
                            </span>
                          ) : isRejected ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-extrabold text-rose-800 border border-rose-200">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              Needs Revision
                            </span>
                          ) : (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                              Draft
                            </span>
                          )}
                        </div>

                        {/* Edit / Delete actions */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleOpenEdit(exp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Listing"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Linked Cultural Tradition Indicator */}
                      {exp.culturalTraditionName && (
                        <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-teal-800 font-semibold bg-teal-50/80 px-2.5 py-1 rounded-lg border border-teal-100">
                          <Landmark className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
                          <span>Tradition: {exp.culturalTraditionName}</span>
                        </div>
                      )}

                      <h3 className="font-bold text-stone-900 mt-2 text-base leading-snug">
                        {exp.title}
                      </h3>

                      <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                        {exp.description.replace(/^\[SAMPLE\]\s*/i, '')}
                      </p>

                      {/* Verification Notes / Rejection Feedback if present */}
                      {exp.verificationNotes && (
                        <div className="mt-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                          <span className="font-bold text-slate-800">Authority Note: </span>
                          <span>{exp.verificationNotes}</span>
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-4 text-xs text-stone-500">
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-stone-400" />
                          {exp.durationHours} hrs
                        </span>
                        <span className="flex items-center">
                          <Users className="w-3.5 h-3.5 mr-1 text-stone-400" />
                          Up to {exp.maxGroupSize} participants
                        </span>
                      </div>
                    </div>

                    {/* Bottom Footer */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center font-bold text-stone-900">
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>{Number(exp.pricePerPerson).toLocaleString('en-IN')}</span>
                        <span className="text-[11px] font-normal text-stone-400"> /person</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {(isDraft || isRejected) && (
                          <button
                            onClick={() => handleSubmitForReview(exp.id)}
                            disabled={submittingExpId === exp.id}
                            className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition-colors disabled:opacity-50"
                          >
                            <Send className="w-3 h-3" />
                            <span>{submittingExpId === exp.id ? 'Submitting...' : 'Submit for Verification'}</span>
                          </button>
                        )}

                        <Link
                          href={`/experiences/${exp.id}`}
                          className="text-amber-600 hover:text-amber-700 font-semibold"
                        >
                          View Public Page →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: Register / Edit Hotel Property */}
      {hotelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  {editingHotel ? 'Edit Property Details' : 'Register Stay / Accommodation Property'}
                </h3>
                <p className="text-xs text-stone-500">
                  Protected with server-side partner ownership and official YatraSetu verification lifecycle
                </p>
              </div>
              <button
                onClick={() => setHotelModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitHotel} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Property Name *</label>
                  <input
                    type="text"
                    required
                    value={hotelFormData.name}
                    onChange={(e) => setHotelFormData({ ...hotelFormData, name: e.target.value })}
                    placeholder="e.g. Royal Heritage Haveli"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Accommodation Type *</label>
                  <select
                    value={hotelFormData.category}
                    onChange={(e) => setHotelFormData({ ...hotelFormData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-indigo-500 focus:outline-none"
                  >
                    {HOTEL_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Full Address *</label>
                <input
                  type="text"
                  required
                  value={hotelFormData.address}
                  onChange={(e) => setHotelFormData({ ...hotelFormData, address: e.target.value })}
                  placeholder="e.g. Near Fort Gate, Old City Heritage Road"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={hotelFormData.city}
                    onChange={(e) => setHotelFormData({ ...hotelFormData, city: e.target.value })}
                    placeholder="e.g. Jodhpur"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">State / UT *</label>
                  <input
                    type="text"
                    required
                    value={hotelFormData.state}
                    onChange={(e) => setHotelFormData({ ...hotelFormData, state: e.target.value })}
                    placeholder="e.g. Rajasthan"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="font-bold text-stone-700 block mb-1">Pincode (Optional)</label>
                  <input
                    type="text"
                    value={hotelFormData.pincode}
                    onChange={(e) => setHotelFormData({ ...hotelFormData, pincode: e.target.value })}
                    placeholder="e.g. 342001"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Latitude (GPS)</label>
                  <input
                    type="number"
                    step="any"
                    value={hotelFormData.latitude}
                    onChange={(e) => setHotelFormData({ ...hotelFormData, latitude: e.target.value })}
                    placeholder="e.g. 26.2918"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Longitude (GPS)</label>
                  <input
                    type="number"
                    step="any"
                    value={hotelFormData.longitude}
                    onChange={(e) => setHotelFormData({ ...hotelFormData, longitude: e.target.value })}
                    placeholder="e.g. 73.0168"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={hotelFormData.contactPhone}
                    onChange={(e) => setHotelFormData({ ...hotelFormData, contactPhone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={hotelFormData.contactEmail}
                    onChange={(e) => setHotelFormData({ ...hotelFormData, contactEmail: e.target.value })}
                    placeholder="stay@example.com"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Official Website</label>
                  <input
                    type="url"
                    value={hotelFormData.officialWebsite}
                    onChange={(e) => setHotelFormData({ ...hotelFormData, officialWebsite: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Check-in Time</label>
                  <input
                    type="text"
                    value={hotelFormData.checkInTime}
                    onChange={(e) => setHotelFormData({ ...hotelFormData, checkInTime: e.target.value })}
                    placeholder="12:00 PM"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Check-out Time</label>
                  <input
                    type="text"
                    value={hotelFormData.checkOutTime}
                    onChange={(e) => setHotelFormData({ ...hotelFormData, checkOutTime: e.target.value })}
                    placeholder="11:00 AM"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Amenities (Comma separated)</label>
                <input
                  type="text"
                  value={hotelFormData.amenities}
                  onChange={(e) => setHotelFormData({ ...hotelFormData, amenities: e.target.value })}
                  placeholder="Free WiFi, Hot Water, Rooftop Restaurant, Traditional Decor"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Property Image URL</label>
                <input
                  type="url"
                  value={hotelFormData.imageUrl}
                  onChange={(e) => setHotelFormData({ ...hotelFormData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Property Description</label>
                <textarea
                  rows={3}
                  value={hotelFormData.description}
                  onChange={(e) => setHotelFormData({ ...hotelFormData, description: e.target.value })}
                  placeholder="Describe your property heritage, hospitality, neighborhood, and guest amenities..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-stone-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setHotelModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-stone-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingHotelForm}
                  className="px-5 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow disabled:opacity-50"
                >
                  {submittingHotelForm
                    ? 'Saving...'
                    : editingHotel
                    ? 'Update Property'
                    : 'Register Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Experience or Cultural Listing */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  {editingExp
                    ? CULTURAL_CATEGORIES.includes(formData.category) || !!formData.culturalTraditionId
                      ? 'Edit Cultural Experience'
                      : 'Edit Tour Listing'
                    : activeTab === 'CULTURE'
                    ? 'Create Cultural Experience'
                    : 'Create New Tour'}
                </h3>
                <p className="text-xs text-stone-500">
                  Protected with strict server-side partner ownership and geographic validation
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Category selector */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-amber-400 focus:outline-none"
                  >
                    <optgroup label="Local Culture & Artisans">
                      {CULTURAL_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Tours & Sights">
                      {TOUR_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Duration (Hours) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="12"
                    required
                    value={formData.durationHours}
                    onChange={(e) => setFormData({ ...formData, durationHours: parseFloat(e.target.value) || 1 })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Cultural Tradition Selector (Live Authentic Registry) */}
              {(activeTab === 'CULTURE' || CULTURAL_CATEGORIES.includes(formData.category)) && (
                <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-teal-950 flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-teal-700" />
                      <span>Link Authentic Cultural Tradition</span>
                    </label>
                    <span className="text-[10px] text-teal-700 font-semibold">Official Knowledge</span>
                  </div>

                  {/* Search inside traditions */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter traditions by craft name or state..."
                      value={traditionSearch}
                      onChange={(e) => setTraditionSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-teal-200 bg-white text-stone-800 text-xs focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <select
                    value={formData.culturalTraditionId}
                    onChange={(e) => setFormData({ ...formData, culturalTraditionId: e.target.value })}
                    className="w-full rounded-xl border border-teal-200 bg-white px-3 py-2 text-stone-900 focus:border-teal-400 focus:outline-none"
                  >
                    <option value="">-- Select Cultural Tradition --</option>
                    {filteredTraditions.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.traditionName} ({t.stateName || t.stateId}) {t.isGiTagged ? '• [GI Tagged]' : ''}
                      </option>
                    ))}
                  </select>

                  {/* Display Selected Tradition Provenance Pill */}
                  {selectedTraditionObj && (
                    <div className="p-2 bg-white rounded-xl border border-teal-100 text-[11px] text-teal-900 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{selectedTraditionObj.traditionName}</span>
                        {selectedTraditionObj.isGiTagged && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[9px] flex items-center gap-1">
                            <Award className="w-2.5 h-2.5" /> GI Registered
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-[10px] line-clamp-1">
                        {selectedTraditionObj.craftType} • Cluster: {selectedTraditionObj.primaryProducingCluster || selectedTraditionObj.stateName}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="font-bold text-stone-700 block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={
                    activeTab === 'CULTURE'
                      ? 'e.g. Traditional Kalamkari Hand-Painting Masterclass'
                      : 'e.g. Dawn Heritage Ghats & Hidden Alleys Walk'
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Price / Person (₹ INR) *</label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    required
                    value={formData.pricePerPerson}
                    onChange={(e) => setFormData({ ...formData, pricePerPerson: parseFloat(e.target.value) || 100 })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Max Group Size *</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={formData.maxGroupSize}
                    onChange={(e) => setFormData({ ...formData, maxGroupSize: parseInt(e.target.value, 10) || 8 })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={
                    activeTab === 'CULTURE'
                      ? 'Describe the authentic craft tradition, master artisan history, workshop steps, and materials...'
                      : 'Describe the journey, stories, stops, and what makes it extraordinary...'
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-stone-900 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">What&apos;s Included (Comma separated)</label>
                <input
                  type="text"
                  value={formData.includedItems}
                  onChange={(e) => setFormData({ ...formData, includedItems: e.target.value })}
                  placeholder="e.g. Master artisan guidance, Raw materials, Take-home craft piece, Chai"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Requirements</label>
                  <input
                    type="text"
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="e.g. Open to all skill levels"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Languages (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.languages}
                    onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                    placeholder="e.g. English, Hindi, Telugu"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Cover Photo URL</label>
                <input
                  type="url"
                  value={formData.coverImageUrl}
                  onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                  placeholder="https://upload.wikimedia.org/..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-stone-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 rounded-xl font-bold shadow disabled:opacity-50 ${
                    activeTab === 'CULTURE'
                      ? 'bg-teal-700 hover:bg-teal-600 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                  }`}
                >
                  {submitting
                    ? 'Saving...'
                    : editingExp
                    ? 'Update Experience'
                    : activeTab === 'CULTURE'
                    ? 'Create Cultural Experience'
                    : 'Create Tour Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal: Property Rooms & Inventory Management Overlay */}
      {selectedHotelForRooms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-5 flex-shrink-0">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-md px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                    {selectedHotelForRooms.category?.replace(/_/g, ' ') || 'HOTEL'}
                  </span>
                  <span className="text-xs font-semibold text-stone-500">
                    {selectedHotelForRooms.cityName}, {selectedHotelForRooms.stateName}
                  </span>
                  {selectedHotelForRooms.verificationStatus === 'VERIFIED' && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Partner Property
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-extrabold text-stone-900 mt-1">
                  {selectedHotelForRooms.hotelName} — Rooms &amp; Inventory Foundation
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Configure physical room configurations and capacity units. (Rates and live date booking will connect with future PMS integration)
                </p>
              </div>

              <button
                onClick={() => setSelectedHotelForRooms(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content area: Scrollable */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-stone-700">
                  Registered Room Configurations ({hotelRooms.length})
                </div>
                <button
                  onClick={handleOpenCreateRoom}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Room Type</span>
                </button>
              </div>

              {loadingRooms ? (
                <div className="rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400 animate-pulse">
                  Loading room configurations...
                </div>
              ) : hotelRooms.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-3">
                  <BedDouble className="w-8 h-8 text-indigo-400 mx-auto" />
                  <h4 className="text-sm font-bold text-stone-800">No Room Types Configured</h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Add the physical room types for this property (e.g. Deluxe Room, Heritage Suite, Family Room) along with their physical unit capacities.
                  </p>
                  <button
                    onClick={handleOpenCreateRoom}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow"
                  >
                    Add First Room Type
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {hotelRooms.map((room) => (
                    <div
                      key={room.id}
                      className="rounded-2xl border border-slate-200 bg-stone-50/50 p-4.5 transition hover:border-slate-300 hover:bg-white flex flex-col justify-between gap-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-stone-900 text-sm">{room.roomTypeName}</h4>
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                                room.isActive
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-stone-200 text-stone-600 border-stone-300'
                              }`}
                            >
                              {room.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {room.isAccessible && (
                              <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-200">
                                Accessible
                              </span>
                            )}
                            <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600 border border-stone-200">
                              {room.sourceType === 'PARTNER_SUBMITTED' ? 'Partner Submitted' : room.sourceType}
                            </span>
                          </div>

                          {room.description && (
                            <p className="mt-1 text-xs text-stone-600 leading-relaxed">{room.description}</p>
                          )}
                        </div>

                        {/* Inventory Capacity Badge */}
                        <div className="flex sm:flex-col items-end gap-1 flex-shrink-0">
                          <span className="inline-flex items-center rounded-lg bg-indigo-100/70 px-2.5 py-1 text-xs font-extrabold text-indigo-950 border border-indigo-200">
                            Inventory: {room.baseInventoryUnits} {room.baseInventoryUnits === 1 ? 'Unit' : 'Units'}
                          </span>
                          <span className="text-[10px] text-stone-400">Total physical units</span>
                        </div>
                      </div>

                      {/* Specs */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 border-t border-slate-200/60 pt-2.5">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-stone-400" />
                          <span>Max {room.maxOccupancy} {room.maxOccupancy === 1 ? 'Guest' : 'Guests'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BedDouble className="h-3.5 w-3.5 text-stone-400" />
                          <span>{room.bedConfiguration || 'Bed config not specified'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Maximize2 className="h-3.5 w-3.5 text-stone-400" />
                          <span>{room.roomSizeSqft ? `${room.roomSizeSqft} sq ft` : 'Size not provided'}</span>
                        </div>
                      </div>

                      {/* Amenities */}
                      {room.amenities && room.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {room.amenities.map((amenity, idx) => (
                            <span
                              key={idx}
                              className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-stone-600 border border-stone-200"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="text-[11px] text-stone-400">
                          {room.createdAt ? `Created: ${new Date(room.createdAt).toLocaleDateString('en-IN')}` : 'Configured'}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenRatePlans(room)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-bold text-[11px] border border-emerald-200 transition-colors flex items-center gap-1"
                          >
                            <Tag className="w-3 h-3 text-emerald-700" />
                            <span>Rate Plans</span>
                          </button>
                          <button
                            onClick={() => handleOpenManageInventory(room)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-[11px] border border-indigo-200 transition-colors flex items-center gap-1"
                          >
                            <Sliders className="w-3 h-3 text-indigo-700" />
                            <span>Manage Capacity</span>
                          </button>
                          <button
                            onClick={() => handleOpenEditRoom(room)}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-[11px] transition-colors flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleToggleRoomActive(room)}
                            className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors ${
                              room.isActive
                                ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            {room.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room)}
                            className="p-1 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Room Type"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Transparency Note */}
            <div className="mt-4 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-950 flex items-start gap-2 flex-shrink-0">
              <Info className="w-4 h-4 text-indigo-700 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Inventory Semantics:</strong> Inventory represents the total physical units built in your property. It is distinct from date-specific availability counters, which will be computed once dynamic rate plans and booking systems are integrated.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Room Type */}
      {roomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  {editingRoom ? 'Edit Room Configuration' : 'Add Room Configuration'}
                </h3>
                <p className="text-xs text-stone-500">
                  Define the room category and physical property unit capacity
                </p>
              </div>
              <button
                onClick={() => setRoomModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitRoom} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Room Type Name *</label>
                <input
                  type="text"
                  required
                  value={roomFormData.name}
                  onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
                  placeholder="e.g. Deluxe Heritage King Room"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={roomFormData.description}
                  onChange={(e) => setRoomFormData({ ...roomFormData, description: e.target.value })}
                  placeholder="Describe the room ambiance, decor, view, or heritage elements..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-stone-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Max Occupancy *</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={roomFormData.maxOccupancy}
                    onChange={(e) => setRoomFormData({ ...roomFormData, maxOccupancy: parseInt(e.target.value, 10) || 1 })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Bed Configuration</label>
                  <input
                    type="text"
                    value={roomFormData.bedConfiguration}
                    onChange={(e) => setRoomFormData({ ...roomFormData, bedConfiguration: e.target.value })}
                    placeholder="e.g. 1 King Bed, 2 Twin Beds"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="font-bold text-stone-700 block mb-1">Room Size (Sq Ft)</label>
                  <input
                    type="number"
                    min="50"
                    step="10"
                    value={roomFormData.roomSize}
                    onChange={(e) => setRoomFormData({ ...roomFormData, roomSize: e.target.value })}
                    placeholder="e.g. 350"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Total Physical Units (Capacity) *</label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  required
                  value={roomFormData.baseInventoryUnits}
                  onChange={(e) => setRoomFormData({ ...roomFormData, baseInventoryUnits: parseInt(e.target.value, 10) || 0 })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-indigo-500 focus:outline-none"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Number of physical rooms of this type existing in your establishment.
                </span>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Room Amenities (Comma separated)</label>
                <input
                  type="text"
                  value={roomFormData.amenities}
                  onChange={(e) => setRoomFormData({ ...roomFormData, amenities: e.target.value })}
                  placeholder="e.g. Air Conditioning, Private Bathroom, Hot Shower, Tea/Coffee Maker"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={roomFormData.accessible}
                    onChange={(e) => setRoomFormData({ ...roomFormData, accessible: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span>Wheelchair Accessible</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={roomFormData.isActive}
                    onChange={(e) => setRoomFormData({ ...roomFormData, isActive: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span>Active for Property Listing</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRoomModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-stone-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRoomForm}
                  className="px-5 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow disabled:opacity-50"
                >
                  {submittingRoomForm ? 'Saving...' : editingRoom ? 'Update Room' : 'Register Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Manage Physical Inventory Capacity */}
      {inventoryModalOpen && editingInventoryRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Manage Physical Capacity</h3>
                <p className="text-xs text-stone-500">
                  {editingInventoryRoom.roomTypeName}
                </p>
              </div>
              <button
                onClick={() => setInventoryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="flex rounded-xl bg-slate-100 p-1 mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setInventoryMode('baseline')}
                className={`flex-1 py-1.5 rounded-lg text-center transition ${
                  inventoryMode === 'baseline' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Baseline
              </button>
              <button
                type="button"
                onClick={() => setInventoryMode('single')}
                className={`flex-1 py-1.5 rounded-lg text-center transition ${
                  inventoryMode === 'single' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Single Date
              </button>
              <button
                type="button"
                onClick={() => setInventoryMode('range')}
                className={`flex-1 py-1.5 rounded-lg text-center transition ${
                  inventoryMode === 'range' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Date Range
              </button>
            </div>

            <form onSubmit={handleSubmitInventory} className="space-y-4 text-xs">
              {inventoryMode === 'single' && (
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Target Override Date *</label>
                  <input
                    type="date"
                    required
                    value={inventoryFormData.inventoryDate}
                    onChange={(e) => setInventoryFormData({ ...inventoryFormData, inventoryDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-indigo-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Overrides baseline capacity specifically for this selected date.
                  </span>
                </div>
              )}

              {inventoryMode === 'range' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={inventoryFormData.startDate}
                      onChange={(e) => setInventoryFormData({ ...inventoryFormData, startDate: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-stone-900 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">End Date *</label>
                    <input
                      type="date"
                      required
                      value={inventoryFormData.endDate}
                      onChange={(e) => setInventoryFormData({ ...inventoryFormData, endDate: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-stone-900 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="font-bold text-stone-700 block mb-1">Total Physical Units *</label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  required
                  value={inventoryFormData.totalUnits}
                  onChange={(e) => setInventoryFormData({ ...inventoryFormData, totalUnits: parseInt(e.target.value, 10) || 0 })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-indigo-500 focus:outline-none"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Total physical units in property for this room category.
                </span>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Blocked / Under Maintenance Units</label>
                <input
                  type="number"
                  min="0"
                  max={inventoryFormData.totalUnits}
                  value={inventoryFormData.blockedUnits}
                  onChange={(e) => setInventoryFormData({ ...inventoryFormData, blockedUnits: parseInt(e.target.value, 10) || 0 })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-indigo-500 focus:outline-none"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Units undergoing repair, renovation, or reserved offline.
                </span>
              </div>

              {/* Operational capacity calculation */}
              <div className="rounded-xl bg-stone-50 p-3.5 border border-stone-200 space-y-1">
                <div className="flex justify-between text-stone-500 text-[11px]">
                  <span>Total Physical Capacity:</span>
                  <span className="font-bold text-stone-800">{inventoryFormData.totalUnits} units</span>
                </div>
                <div className="flex justify-between text-stone-500 text-[11px]">
                  <span>Blocked Units:</span>
                  <span className="font-bold text-amber-700">{inventoryFormData.blockedUnits} units</span>
                </div>
                <div className="flex justify-between font-extrabold text-indigo-950 text-xs pt-1.5 border-t border-stone-200">
                  <span>Operational Physical Capacity:</span>
                  <span>{Math.max(0, inventoryFormData.totalUnits - inventoryFormData.blockedUnits)} units</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setInventoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-stone-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingInventoryForm}
                  className="px-5 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow disabled:opacity-50"
                >
                  {submittingInventoryForm ? 'Saving...' : 'Save Capacity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Room Rate Plans Overview */}
      {ratePlanModalOpen && selectedRoomForRatePlans && selectedHotelForRooms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 flex-shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-lg font-bold text-stone-900">
                    Rate Plans &amp; Pricing Foundation
                  </h3>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  {selectedHotelForRooms.hotelName} — <span className="font-semibold text-stone-800">{selectedRoomForRatePlans.roomTypeName}</span>
                </p>
              </div>
              <button
                onClick={() => setRatePlanModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions & Transparency Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 flex-shrink-0">
              <div className="text-xs text-stone-600">
                <span className="font-semibold">{ratePlans.length}</span> {ratePlans.length === 1 ? 'Rate Plan' : 'Rate Plans'} configured
              </div>
              <button
                onClick={handleOpenCreateRatePlan}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Rate Plan</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {loadingRatePlans ? (
                <div className="py-12 text-center text-xs text-stone-400">Loading configured rate plans...</div>
              ) : ratePlans.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-stone-200 p-8 text-center bg-stone-50/50">
                  <Tag className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="font-bold text-stone-700 text-sm">No rate plans configured yet</p>
                  <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                    Create your first rate plan (e.g., Room Only EP or Breakfast Included CP) to establish verified commercial tariffs.
                  </p>
                  <button
                    onClick={handleOpenCreateRatePlan}
                    className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Rate Plan</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {ratePlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`rounded-2xl p-4 border transition-all ${
                        plan.status === 'ACTIVE'
                          ? 'bg-white border-emerald-200/80 shadow-sm'
                          : 'bg-stone-50/80 border-stone-200 opacity-80'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-stone-900 text-sm">{plan.planName}</h4>
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase border ${
                                plan.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-stone-200 text-stone-700 border-stone-300'
                              }`}
                            >
                              {plan.status}
                            </span>
                            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-200 flex items-center gap-1">
                              <Utensils className="w-2.5 h-2.5" />
                              <span>{plan.mealPlan} · {plan.mealPlan === 'EP' ? 'Room Only' : plan.mealPlan === 'CP' ? 'Breakfast' : plan.mealPlan === 'MAP' ? 'Half Board' : 'All Meals'}</span>
                            </span>
                          </div>

                          {plan.description && (
                            <p className="mt-1 text-xs text-stone-600">{plan.description}</p>
                          )}

                          <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-stone-400" />
                              <span>
                                {plan.validFrom && plan.validTo
                                  ? `${new Date(plan.validFrom).toLocaleDateString('en-IN')} → ${new Date(plan.validTo).toLocaleDateString('en-IN')}`
                                  : plan.validFrom
                                  ? `From ${new Date(plan.validFrom).toLocaleDateString('en-IN')}`
                                  : 'Open validity'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                              <span>
                                {plan.cancellationPolicy === 'FREE_CANCELLATION'
                                  ? `Free Cancellation (until ${plan.cancellationDeadlineHours}h prior)`
                                  : plan.cancellationPolicy === 'NON_REFUNDABLE'
                                  ? 'Non-refundable'
                                  : plan.cancellationPolicy}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[11px] font-medium text-stone-600">
                                {plan.taxesIncluded ? '✓ Taxes Included' : 'Taxes May Apply'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Pricing & Actions */}
                        <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <div className="text-right">
                            <div className="text-base font-extrabold text-stone-900 flex items-center justify-end">
                              <IndianRupee className="w-3.5 h-3.5" />
                              <span>{plan.basePrice?.toLocaleString('en-IN')}</span>
                              <span className="text-[10px] text-stone-500 font-normal ml-1">/ {plan.priceUnit?.toLowerCase() || 'night'}</span>
                            </div>
                            <span className="text-[10px] text-stone-400">Base Tariff ({plan.currency})</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditRatePlan(plan)}
                              className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-[11px] transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleRatePlanStatus(plan)}
                              className={`px-2 py-1 rounded-lg font-semibold text-[11px] transition-colors ${
                                plan.status === 'ACTIVE'
                                  ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              {plan.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteRatePlan(plan)}
                              className="p-1 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Rate Plan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Transparency Note */}
            <div className="mt-4 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-[11px] text-emerald-950 flex items-start gap-2 flex-shrink-0">
              <Info className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Pricing Semantics:</strong> Rate plans establish standard commercial tariffs and meal policies. Date-specific real-time availability and final reservation calculations will be determined in future booking integration phases.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Rate Plan Form */}
      {ratePlanFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  {editingRatePlan ? 'Edit Rate Plan' : 'Add Rate Plan'}
                </h3>
                <p className="text-xs text-stone-500">
                  Configure pricing, meal inclusions, validity dates, and cancellation policy
                </p>
              </div>
              <button
                onClick={() => setRatePlanFormModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitRatePlan} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Rate Plan Name *</label>
                <input
                  type="text"
                  required
                  value={ratePlanFormData.planName}
                  onChange={(e) => setRatePlanFormData({ ...ratePlanFormData, planName: e.target.value })}
                  placeholder="e.g. Breakfast Included (CP)"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Meal Plan *</label>
                  <select
                    value={ratePlanFormData.mealPlan}
                    onChange={(e) => setRatePlanFormData({ ...ratePlanFormData, mealPlan: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="EP">EP — European Plan (Room Only)</option>
                    <option value="CP">CP — Continental Plan (Breakfast Included)</option>
                    <option value="MAP">MAP — Modified American Plan (Breakfast + 1 Meal)</option>
                    <option value="AP">AP — American Plan (All Meals Included)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Base Price (INR per Night) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-stone-400 font-semibold">₹</span>
                    <input
                      type="number"
                      min="0"
                      required
                      value={ratePlanFormData.basePrice}
                      onChange={(e) => setRatePlanFormData({ ...ratePlanFormData, basePrice: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-slate-200 pl-8 pr-3.5 py-2.5 text-stone-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Valid From (Optional)</label>
                  <input
                    type="date"
                    value={ratePlanFormData.validFrom}
                    onChange={(e) => setRatePlanFormData({ ...ratePlanFormData, validFrom: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-stone-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Valid To (Optional)</label>
                  <input
                    type="date"
                    value={ratePlanFormData.validTo}
                    onChange={(e) => setRatePlanFormData({ ...ratePlanFormData, validTo: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-stone-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Cancellation Policy *</label>
                  <select
                    value={ratePlanFormData.cancellationPolicy}
                    onChange={(e) => setRatePlanFormData({ ...ratePlanFormData, cancellationPolicy: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="FREE_CANCELLATION">Free Cancellation</option>
                    <option value="NON_REFUNDABLE">Non-Refundable</option>
                    <option value="PARTIAL_REFUND">Partial Refund</option>
                    <option value="CUSTOM">Custom Terms</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Cancellation Notice (Hours)</label>
                  <input
                    type="number"
                    min="0"
                    value={ratePlanFormData.cancellationDeadlineHours}
                    onChange={(e) => setRatePlanFormData({ ...ratePlanFormData, cancellationDeadlineHours: parseInt(e.target.value, 10) || 0 })}
                    placeholder="24"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Description / Inclusions Notes</label>
                <textarea
                  rows={2}
                  value={ratePlanFormData.description}
                  onChange={(e) => setRatePlanFormData({ ...ratePlanFormData, description: e.target.value })}
                  placeholder="e.g. Includes traditional Rajasthani breakfast buffet from 7:30 AM to 10:30 AM..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-stone-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ratePlanFormData.taxesIncluded}
                    onChange={(e) => setRatePlanFormData({ ...ratePlanFormData, taxesIncluded: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span className="font-medium text-stone-700">Taxes are included in base price</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ratePlanFormData.feesIncluded}
                    onChange={(e) => setRatePlanFormData({ ...ratePlanFormData, feesIncluded: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span className="font-medium text-stone-700">Property service fees included</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRatePlanFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-stone-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRatePlanForm}
                  className="px-5 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow disabled:opacity-50"
                >
                  {submittingRatePlanForm ? 'Saving...' : editingRatePlan ? 'Update Rate Plan' : 'Create Rate Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Partner Hotel Bookings & Allocation Audit (Phase 22.6) */}
      {partnerBookingsModalOpen && selectedHotelForBookings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  Property Bookings (Phase 22.6)
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {selectedHotelForBookings.hotelName} — Reservations
                </h3>
                <p className="text-xs text-slate-500">
                  Authoritative reservation records with immutable price snapshots and active inventory holds.
                </p>
              </div>
              <button
                onClick={() => setPartnerBookingsModalOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content: Loading / Empty / List */}
            {loadingPartnerBookings ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-500">Loading hotel reservations...</p>
              </div>
            ) : partnerBookingsList.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 space-y-2">
                <Calendar className="mx-auto w-10 h-10 text-slate-300" />
                <h4 className="text-sm font-bold text-slate-800">No Reservations Yet</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  When travelers reserve rooms for your property, their active allocations and stay records will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {partnerBookingsList.map((b) => (
                    <div
                      key={b.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2.5">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reference</span>
                          <div className="font-mono font-black text-xs text-slate-900">{b.bookingReference}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                            b.bookingStatus === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            b.bookingStatus === 'PENDING_PAYMENT' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            b.bookingStatus === 'CANCELLED' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                            b.bookingStatus === 'EXPIRED' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                            'bg-stone-100 text-stone-700 border-stone-200'
                          }`}>
                            {b.bookingStatus === 'PENDING_PAYMENT' ? 'PENDING PAYMENT' : b.bookingStatus}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {b.paymentStatus}
                          </span>
                        </div>
                      </div>

                      {b.bookingStatus === 'CANCELLED' && b.cancellationReason && (
                        <div className="text-[10px] bg-rose-50 border border-rose-100 text-rose-800 p-2 rounded-lg">
                          <span className="font-bold">Cancellation Reason:</span> {b.cancellationReason}
                        </div>
                      )}

                      {/* Guest Info (Masked PII) */}
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Guest:</span>
                          <span className="font-bold text-slate-900">{b.guestName}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Phone (Masked):</span>
                          <span className="font-mono text-slate-700">{b.guestPhone}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Email (Masked):</span>
                          <span className="font-mono text-slate-700">{b.guestEmail}</span>
                        </div>
                      </div>

                      {/* Room & Stay Details */}
                      <div className="rounded-xl bg-white p-3 border border-slate-200 text-xs space-y-1">
                        <div className="font-bold text-slate-900">{b.roomTypeName}</div>
                        <div className="text-[11px] text-teal-800 font-medium">Plan: {b.ratePlanName} ({b.mealPlan || 'EP'})</div>
                        <div className="flex justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                          <span>{b.checkIn} → {b.checkOut}</span>
                          <span className="font-semibold">{b.numberOfNights} Night(s) · {b.numberOfRooms} Room(s)</span>
                        </div>
                      </div>

                      {/* Price Snapshot */}
                      <div className="flex justify-between items-baseline pt-1 text-xs">
                        <span className="text-slate-500">Commercial Snapshot:</span>
                        <span className="text-sm font-black text-slate-900 flex items-center">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {Number(b.totalAmount).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Privacy & Provenance Disclaimer */}
                <div className="rounded-xl bg-indigo-50/70 p-3.5 border border-indigo-100 text-[11px] text-indigo-950 leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Privacy &amp; RBAC Protection:</p>
                    <p className="text-indigo-900/80">
                      Traveler contact PII is automatically masked in accordance with YatraSetu privacy compliance. Commercial pricing snapshots are immutable.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setPartnerBookingsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

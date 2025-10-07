"use client";

import React, { useState, useEffect, useMemo, useContext } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { AuthContext } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
];

const normalizeId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (value.$oid) return value.$oid;
    if (value.toString) return value.toString();
  }
  return String(value);
};

const parsePriceValue = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const numeric = value.replace(/[^0-9.]/g, "");
    const priceNumber = parseFloat(numeric);
    return Number.isFinite(priceNumber) ? priceNumber : 0;
  }
  return 0;
};

const formatPriceDisplay = (value) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "number") return `${value.toLocaleString()} ฿`;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/฿|บาท/.test(trimmed)) return trimmed;
    const priceNumber = parsePriceValue(trimmed);
    return priceNumber > 0 ? `${priceNumber.toLocaleString()} ฿` : trimmed;
  }
  return String(value);
};

const getStartingPrice = (service) => {
  if (!service?.priceOptions?.length) return null;
  const prices = service.priceOptions
    .map((option) => parsePriceValue(option.price))
    .filter((price) => Number.isFinite(price) && price > 0);

  if (!prices.length) return null;
  return Math.min(...prices);
};

const ServiceBookingFlow = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [currentStep, setCurrentStep] = useState(1);
  const [services, setServices] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedPriceId, setSelectedPriceId] = useState("");
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState("");
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    customerInfo: {
      name: "",
      phone: "",
      email: "",
      address: "",
    },
    paymentMethod: "qr_code",
    promoCode: "",
  });
  const [bookedTimeSlots, setBookedTimeSlots] = useState([]);
  const [timeLoading, setTimeLoading] = useState(false);
  const [timeError, setTimeError] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrGenerating, setQrGenerating] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [createdBooking, setCreatedBooking] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      setServicesLoading(true);
      setServicesError("");
      try {
        const response = await axios.get("/api/services");
        const data = Array.isArray(response.data) ? response.data : [];
        const mappedServices = data.map((service, index) => {
          const id = normalizeId(service._id || service.id || index);
          const normalizedOptions = Array.isArray(service.priceOptions)
            ? service.priceOptions.map((option, optionIndex) => ({
                id: normalizeId(option.id || option._id || `${id}-option-${optionIndex}`),
                option:
                  option.option ||
                  option.label ||
                  option.name ||
                  `ตัวเลือก ${optionIndex + 1}`,
                price: option.price,
                description: option.description || option.details || "",
              }))
            : [];

          return {
            id,
            name: service.name || "บริการ",
            serviceType: service.serviceType || "บริการอื่น ๆ",
            image: service.image || "/home-img/service-1.jpg",
            priceOptions: normalizedOptions,
          };
        });

        const types = [
          ...new Set(
            mappedServices
              .map((service) => service.serviceType)
              .filter(Boolean)
          ),
        ];

        setServices(mappedServices);
        setServiceTypes(types);
        setSelectedType((prev) =>
          prev && types.includes(prev) ? prev : types[0] || ""
        );
      } catch (error) {
        console.error("Failed to load services:", error);
        setServicesError("ไม่สามารถโหลดข้อมูลบริการได้");
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    if (!user) return;
    setBookingData((prev) => ({
      ...prev,
      customerInfo: {
        name:
          prev.customerInfo.name ||
          `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
          user.name ||
          "",
        phone: prev.customerInfo.phone || user.phone || "",
        email: prev.customerInfo.email || user.email || "",
        address: prev.customerInfo.address || user.location || "",
      },
    }));
  }, [user]);

  useEffect(() => {
    if (!selectedType) return;
    const servicesInType = services.filter(
      (service) => service.serviceType === selectedType
    );
    if (!servicesInType.length) {
      setSelectedServiceId("");
      return;
    }
    setSelectedServiceId((prev) => {
      if (prev && servicesInType.some((service) => service.id === prev)) {
        return prev;
      }
      return servicesInType[0].id;
    });
  }, [selectedType, services]);

  useEffect(() => {
    setSelectedPriceId("");
    setBookingData((prev) => ({
      ...prev,
      date: "",
      time: "",
    }));
    setBookedTimeSlots([]);
    setQrGenerated(false);
    setQrCodeUrl("");
  }, [selectedServiceId]);

  useEffect(() => {
    const fetchBookedTimes = async () => {
      if (!selectedServiceId || !bookingData.date) {
        setBookedTimeSlots([]);
        return;
      }

      setTimeLoading(true);
      setTimeError("");
      try {
        const params = new URLSearchParams({
          serviceId: selectedServiceId,
          bookingDate: bookingData.date,
        });
        const response = await axios.get(`/api/bookings?${params.toString()}`);
        const bookings = Array.isArray(response.data)
          ? response.data
          : response.data?.bookings || response.data?.data || [];

        const takenSlots = bookings
          .filter((booking) => {
            const statusText = (booking.status || "").toString().toLowerCase();
            if (statusText.includes("cancel") || statusText.includes("reject")) {
              return false;
            }
            return Boolean(booking.bookingTime || booking.time);
          })
          .map((booking) => booking.bookingTime || booking.time)
          .filter(Boolean);

        setBookedTimeSlots([...new Set(takenSlots)]);
      } catch (error) {
        console.error("Failed to fetch booked times:", error);
        setTimeError("ไม่สามารถโหลดข้อมูลเวลาที่ถูกจองแล้ว");
      } finally {
        setTimeLoading(false);
      }
    };

    fetchBookedTimes();
  }, [selectedServiceId, bookingData.date]);

  const currentService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) || null,
    [services, selectedServiceId]
  );

  const selectedPriceOption = useMemo(
    () =>
      currentService?.priceOptions?.find(
        (option) => normalizeId(option.id) === normalizeId(selectedPriceId)
      ) || null,
    [currentService, selectedPriceId]
  );

  const totalPrice = useMemo(
    () => parsePriceValue(selectedPriceOption?.price || 0),
    [selectedPriceOption]
  );

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const steps = [
    { id: 1, title: "เลือกบริการ", subtitle: "เลือกบริการและแพ็กเกจ" },
    { id: 2, title: "รายละเอียดการจอง", subtitle: "เลือกวันที่และกรอกข้อมูล" },
    { id: 3, title: "ชำระเงิน", subtitle: "เลือกวิธีชำระเงิน" },
    { id: 4, title: "เสร็จสิ้น", subtitle: "ยืนยันการจอง" },
  ];

  const renderStepIndicator = () => (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 flex items-center justify-center border-2 rounded-full text-sm font-semibold transition-all ${
                  currentStep === step.id
                    ? "border-blue-500 bg-blue-500 text-white shadow-md"
                    : currentStep > step.id
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                {currentStep > step.id ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </div>
              <div className="mt-3 text-center">
                <div
                  className={`font-medium ${
                    currentStep === step.id
                      ? "text-blue-600"
                      : currentStep > step.id
                      ? "text-green-600"
                      : "text-slate-500"
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-xs text-slate-400 mt-1">{step.subtitle}</div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 px-4">
                <div className="h-0.5 bg-slate-200 relative overflow-hidden rounded-full">
                  <div
                    className={`absolute top-0 left-0 h-full transition-all duration-300 ${
                      currentStep > step.id ? "bg-green-500 w-full" : "bg-transparent w-0"
                    }`}
                  />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const handleGenerateQRCode = async () => {
    if (currentStep !== 3) return;
    if (!selectedPriceOption || !bookingData.date || !bookingData.time) {
      setBookingError("กรุณาเลือกแพ็กเกจ วันที่ และเวลาให้ครบก่อนสร้าง QR Code");
      return;
    }

    setBookingError("");
    setQrGenerating(true);
    try {
      const qrPayload = JSON.stringify({
        service: currentService?.name,
        option: selectedPriceOption?.option,
        amount: totalPrice,
        date: bookingData.date,
        time: bookingData.time,
      });
      const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(qrPayload)}&size=260&margin=1`;
      setQrCodeUrl(qrUrl);
      setQrGenerated(true);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
      setBookingError("ไม่สามารถสร้าง QR Code ได้ กรุณาลองอีกครั้ง");
    } finally {
      setQrGenerating(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!user?.userId && !user?._id) {
      alert("กรุณาเข้าสู่ระบบก่อนทำการจอง");
      router.push("/page/login");
      return;
    }

    if (!currentService || !selectedPriceOption) {
      setBookingError("กรุณาเลือกบริการและแพ็กเกจที่ต้องการ");
      setCurrentStep(1);
      return;
    }

    if (!bookingData.date || !bookingData.time) {
      setBookingError("กรุณาเลือกวันที่และเวลาที่ต้องการให้บริการ");
      setCurrentStep(2);
      return;
    }

    if (bookedTimeSlots.includes(bookingData.time)) {
      setBookingError("เวลานี้ถูกจองแล้ว กรุณาเลือกเวลาอื่น");
      return;
    }

    const userId = normalizeId(user.userId || user._id);
    if (!userId) {
      setBookingError("ไม่พบข้อมูลผู้ใช้งาน");
      return;
    }

    const payload = {
      serviceId: normalizeId(currentService.id),
      userId,
      serviceName: currentService.name,
      serviceCategory: currentService.serviceType,
      estimatedPrice: formatPriceDisplay(selectedPriceOption.price),
      selectedOption: selectedPriceOption.option,
      customerName:
        bookingData.customerInfo.name ||
        `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
      customerEmail: bookingData.customerInfo.email || user.email || "",
      customerPhone: bookingData.customerInfo.phone || user.phone || "",
      customerLocation: bookingData.customerInfo.address || user.location || "",
      bookingDate: bookingData.date,
      bookingTime: bookingData.time,
      paymentMethod:
        bookingData.paymentMethod === "credit_card" ? "credit_card" : "qr_code",
      amount: totalPrice,
      promoCode: bookingData.promoCode || undefined,
    };

    setBookingLoading(true);
    setBookingError("");
    try {
      const response = await axios.post("/api/bookings/[id]", payload);
      if (response.status !== 201) {
        throw new Error(response.data?.message || "สร้างคำสั่งจองไม่สำเร็จ");
      }

      const bookingResponse = response.data?.booking || {};
      const normalizedBooking = {
        ...bookingResponse,
        _id:
          normalizeId(bookingResponse._id) ||
          normalizeId(response.data?.bookingId),
        serviceName: bookingResponse.serviceName || payload.serviceName,
        serviceCategory:
          bookingResponse.serviceCategory || payload.serviceCategory,
        selectedOption:
          bookingResponse.selectedOption || payload.selectedOption,
        estimatedPrice:
          bookingResponse.estimatedPrice || payload.estimatedPrice,
        bookingDate:
          bookingResponse.bookingDate || bookingResponse.date || payload.bookingDate,
        bookingTime:
          bookingResponse.bookingTime || bookingResponse.time || payload.bookingTime,
        paymentMethod: bookingResponse.paymentMethod || payload.paymentMethod,
        customerName: bookingResponse.customerName || payload.customerName,
        customerEmail: bookingResponse.customerEmail || payload.customerEmail,
        customerPhone: bookingResponse.customerPhone || payload.customerPhone,
        customerLocation:
          bookingResponse.customerLocation || payload.customerLocation,
        amount: bookingResponse.amount || payload.amount,
      };

      setCreatedBooking(normalizedBooking);
      setCurrentStep(4);
    } catch (error) {
      console.error("Booking error:", error);
      setBookingError(
        error.response?.data?.message ||
          error.message ||
          "เกิดข้อผิดพลาดในการจองบริการ"
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePaymentAction = async () => {
    if (bookingData.paymentMethod === "qr_code" && !qrGenerated) {
      await handleGenerateQRCode();
      return;
    }
    await handleConfirmBooking();
  };

  const handleGoBack = () => {
    setBookingError("");
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleProceedFromStepOne = () => {
    if (!selectedServiceId || !selectedPriceId) {
      setBookingError("กรุณาเลือกบริการและแพ็กเกจที่ต้องการก่อนดำเนินการต่อ");
      return;
    }
    if (!user) {
      alert("กรุณาเข้าสู่ระบบก่อนทำการจอง");
      router.push("/page/login");
      return;
    }
    setBookingError("");
    setCurrentStep(2);
  };

  const handleProceedFromStepTwo = () => {
    if (!bookingData.date || !bookingData.time) {
      setBookingError("กรุณาเลือกวันที่และเวลาที่ต้องการให้บริการ");
      return;
    }
    if (bookedTimeSlots.includes(bookingData.time)) {
      setBookingError("เวลานี้ถูกจองแล้ว กรุณาเลือกเวลาอื่น");
      return;
    }
    setBookingError("");
    setCurrentStep(3);
  };

  const handleResetFlow = () => {
    setCurrentStep(1);
    setSelectedPriceId("");
    setBookingData({
      date: "",
      time: "",
      customerInfo: {
        name:
          `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
          user?.name ||
          "",
        phone: user?.phone || "",
        email: user?.email || "",
        address: user?.location || "",
      },
      paymentMethod: "qr_code",
      promoCode: "",
    });
    setQrCodeUrl("");
    setQrGenerated(false);
    setCreatedBooking(null);
    setBookingError("");
  };

  const filteredServices = selectedType
    ? services.filter((service) => service.serviceType === selectedType)
    : services;

  const renderServiceTabs = () => (
    <div className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap gap-3">
        {serviceTypes.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedType === type
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {type}
          </button>
        ))}
        <div className="ml-auto text-sm text-blue-600 flex items-center gap-2">
          <span>ดูบริการทั้งหมด</span>
          <Link
            href="/page/servicehub"
            className="underline hover:text-blue-800"
          >
            Service Hub
          </Link>
        </div>
      </div>
    </div>
  );

  const renderServiceSelection = () => (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        {renderStepIndicator()}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">เลือกบริการ</h2>
              <p className="text-gray-500 text-sm mt-1">
                เลือกบริการที่ต้องการจากรายการที่มีในระบบจริง
              </p>
            </div>
            <div className="text-sm text-gray-500">
              หากไม่พบบริการที่ต้องการ กรุณาติดต่อเจ้าหน้าที่
            </div>
          </div>

          {servicesLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : servicesError ? (
            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>{servicesError}</span>
            </div>
          ) : !filteredServices.length ? (
            <div className="p-6 bg-gray-50 border border-dashed border-gray-300 text-center rounded-lg">
              <p className="text-gray-600">
                ยังไม่มีบริการในหมวดหมู่นี้ กรุณาเลือกหมวดหมู่อื่น
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredServices.map((service) => {
                const startingPrice = getStartingPrice(service);
                const isSelected = selectedServiceId === service.id;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setSelectedServiceId(service.id)}
                    className={`text-left border rounded-xl p-4 transition-all bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isSelected
                        ? "border-blue-500 shadow-md"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={service.image}
                          alt={service.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                            {service.serviceType}
                          </span>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600">
                              <ShieldCheck className="w-4 h-4" />
                              เลือกอยู่
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {service.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          ราคาเริ่มต้น {startingPrice ? `${startingPrice.toLocaleString()} ฿` : "-"}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {service.priceOptions.length} แพ็กเกจให้เลือก
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              เลือกแพ็กเกจ / ราคา
            </h3>
            {currentService?.priceOptions?.length ? (
              <div className="space-y-3">
                {currentService.priceOptions.map((option) => {
                  const isChecked =
                    normalizeId(option.id) === normalizeId(selectedPriceId);
                  return (
                    <label
                      key={option.id}
                      className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                        isChecked
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="price-option"
                        className="accent-blue-600"
                        checked={isChecked}
                        onChange={() => setSelectedPriceId(option.id)}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {option.option}
                        </div>
                        {option.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            {option.description}
                          </div>
                        )}
                      </div>
                      <div className="text-blue-600 font-semibold">
                        {formatPriceDisplay(option.price)}
                      </div>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 border border-dashed border-gray-300 rounded-lg text-gray-500">
                บริการนี้ยังไม่มีแพ็กเกจราคา กรุณาติดต่อเจ้าหน้าที่
              </div>
            )}
          </div>

          {bookingError && (
            <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span>{bookingError}</span>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleProceedFromStepOne}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={!selectedServiceId || !selectedPriceId || servicesLoading}
            >
              ดำเนินการต่อ
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBookingForm = () => (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        {renderStepIndicator()}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">รายละเอียดการจอง</h2>
              <p className="text-gray-500 text-sm mt-1">
                กรุณาเลือกวันที่ เวลา และกรอกข้อมูลติดต่อให้ครบถ้วน
              </p>
            </div>
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4" /> กลับไปเลือกบริการ
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                ข้อมูลบริการ
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    บริการที่เลือก
                  </label>
                  <div className="p-3 bg-blue-50 rounded-lg text-blue-700 text-sm">
                    {currentService?.name} - {selectedPriceOption?.option}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วันที่ให้บริการ
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="date"
                      min={today}
                      value={bookingData.date}
                      onChange={(e) => {
                        setBookingData((prev) => ({ ...prev, date: e.target.value }));
                        setQrGenerated(false);
                        setQrCodeUrl("");
                      }}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เวลาให้บริการ
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <select
                      value={bookingData.time}
                      onChange={(e) => {
                        setBookingData((prev) => ({ ...prev, time: e.target.value }));
                        setQrGenerated(false);
                        setQrCodeUrl("");
                      }}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">เลือกเวลา</option>
                      {timeSlots.map((slot) => (
                        <option
                          key={slot}
                          value={slot}
                          disabled={bookedTimeSlots.includes(slot)}
                        >
                          {slot} น.
                          {bookedTimeSlots.includes(slot) ? " (ถูกจองแล้ว)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  {timeLoading && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 mt-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      กำลังตรวจสอบเวลาที่เหลือว่าง...
                    </div>
                  )}
                  {timeError && (
                    <div className="flex items-center gap-2 text-sm text-red-600 mt-2">
                      <AlertCircle className="w-4 h-4" />
                      {timeError}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ที่อยู่สำหรับให้บริการ
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <textarea
                      value={bookingData.customerInfo.address}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          customerInfo: {
                            ...prev.customerInfo,
                            address: e.target.value,
                          },
                        }))
                      }
                      rows={3}
                      placeholder="กรอกที่อยู่ที่ต้องการให้บริการ"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                ข้อมูลลูกค้า
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อ-นามสกุล
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={bookingData.customerInfo.name}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          customerInfo: {
                            ...prev.customerInfo,
                            name: e.target.value,
                          },
                        }))
                      }
                      placeholder="กรอกชื่อ-นามสกุล"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เบอร์โทรศัพท์
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={bookingData.customerInfo.phone}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          customerInfo: {
                            ...prev.customerInfo,
                            phone: e.target.value,
                          },
                        }))
                      }
                      placeholder="กรอกเบอร์โทร"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    อีเมล
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={bookingData.customerInfo.email}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          customerInfo: {
                            ...prev.customerInfo,
                            email: e.target.value,
                          },
                        }))
                      }
                      placeholder="กรอกอีเมล"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>ราคาบริการ</span>
                    <span>{formatPriceDisplay(selectedPriceOption?.price)}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold mt-2">
                    <span>ราคารวม</span>
                    <span>{totalPrice ? `${totalPrice.toLocaleString()} ฿` : formatPriceDisplay(selectedPriceOption?.price)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {bookingError && (
            <div className="mt-6 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span>{bookingError}</span>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <button
              onClick={handleGoBack}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ย้อนกลับ
            </button>
            <button
              onClick={handleProceedFromStepTwo}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ดำเนินการต่อ
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto p-6">
        {renderStepIndicator()}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">ชำระเงิน</h2>
              <p className="text-gray-500 text-sm mt-1">
                เลือกวิธีชำระเงินที่คุณต้องการ
              </p>
            </div>
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4" /> ย้อนกลับไปกรอกรายละเอียด
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">สรุปการจอง</h3>
              <div className="space-y-1 text-sm text-blue-700">
                <p>บริการ: {currentService?.name}</p>
                <p>แพ็กเกจ: {selectedPriceOption?.option}</p>
                <p>วันที่: {bookingData.date}</p>
                <p>เวลา: {bookingData.time} น.</p>
                <p>ยอดชำระ: {totalPrice ? `${totalPrice.toLocaleString()} ฿` : formatPriceDisplay(selectedPriceOption?.price)}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">วิธีการชำระเงิน</h3>
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="qr_code"
                    checked={bookingData.paymentMethod === "qr_code"}
                    onChange={(e) => setBookingData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                    className="mr-3 accent-blue-600"
                  />
                  <span className="w-5 h-5 mr-2 flex items-center justify-center bg-green-100 text-green-600 text-xs rounded">
                    QR
                  </span>
                  <span>QR Code พร้อมเพย์</span>
                </label>

                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={bookingData.paymentMethod === "credit_card"}
                    onChange={(e) => setBookingData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                    className="mr-3 accent-blue-600"
                  />
                  <CreditCard className="w-5 h-5 mr-2" />
                  <span>บัตรเครดิต / เดบิต</span>
                </label>
              </div>
            </div>

            {bookingData.paymentMethod === "credit_card" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    หมายเลขบัตร
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วันหมดอายุ
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVC
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รหัสโปรโมชั่น (ถ้ามี)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={bookingData.promoCode}
                  onChange={(e) => setBookingData((prev) => ({ ...prev, promoCode: e.target.value }))}
                  placeholder="กรอกรหัสส่วนลด"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  className="px-4 py-3 bg-blue-100 text-blue-600 rounded-lg"
                >
                  ใช้รหัส
                </button>
              </div>
            </div>

            {bookingData.paymentMethod === "qr_code" && qrGenerated && (
              <div className="border border-blue-200 rounded-xl p-6 bg-blue-50 flex flex-col items-center text-center">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">
                  สแกนเพื่อชำระเงิน
                </h4>
                <p className="text-sm text-blue-600 mb-4">
                  ยอดชำระ {totalPrice ? `${totalPrice.toLocaleString()} ฿` : formatPriceDisplay(selectedPriceOption?.price)}
                </p>
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                </div>
                <p className="text-xs text-blue-600 mt-3">
                  หลังจากชำระเงินแล้ว กรุณากดยืนยันการจองเพื่อบันทึกข้อมูล
                </p>
              </div>
            )}

            {bookingError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>{bookingError}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <button
                onClick={handleGoBack}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={handlePaymentAction}
                disabled={bookingLoading || qrGenerating}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {bookingLoading || qrGenerating
                  ? "กำลังดำเนินการ..."
                  : bookingData.paymentMethod === "qr_code" && !qrGenerated
                  ? "สร้าง QR Code"
                  : "ยืนยันการจอง"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => {
    const bookingId = normalizeId(createdBooking?._id);
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            บันทึกการจองเรียบร้อย
          </h2>
          <p className="text-gray-600 mb-6">
            ระบบได้บันทึกข้อมูลการจองของคุณแล้ว สามารถตรวจสอบสถานะได้ทุกเมื่อ
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-left space-y-2 text-sm text-gray-700 mb-6">
            <p>
              <span className="font-medium">หมายเลขการจอง:</span> {bookingId || "-"}
            </p>
            <p>
              <span className="font-medium">บริการ:</span> {createdBooking?.serviceName}
            </p>
            <p>
              <span className="font-medium">แพ็กเกจ:</span> {createdBooking?.selectedOption}
            </p>
            <p>
              <span className="font-medium">วันที่:</span> {createdBooking?.bookingDate}
            </p>
            <p>
              <span className="font-medium">เวลา:</span> {createdBooking?.bookingTime} น.
            </p>
            <p>
              <span className="font-medium">ยอดชำระ:</span> {createdBooking?.amount ? `${Number(createdBooking.amount).toLocaleString()} ฿` : formatPriceDisplay(createdBooking?.estimatedPrice)}
            </p>
            <p>
              <span className="font-medium">วิธีชำระเงิน:</span> {createdBooking?.paymentMethod === "credit_card" ? "บัตรเครดิต" : "QR Code"}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                if (bookingId) {
                  router.push(`/page/booking-status?bookingId=${bookingId}`);
                } else {
                  router.push("/page/userhistory");
                }
              }}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ดูสถานะการจอง
            </button>
            <button
              onClick={handleResetFlow}
              className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              จองบริการใหม่
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            กรุณาเข้าสู่ระบบก่อนจองบริการ
          </h2>
          <p className="text-gray-600 text-sm">
            คุณต้องเข้าสู่ระบบเพื่อดูบริการและทำการจอง หากยังไม่มีบัญชีสามารถสมัครสมาชิกได้ฟรี
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/page/login"
              className="w-full inline-flex items-center justify-center py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/page/register"
              className="w-full inline-flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              สมัครสมาชิก
            </Link>
          </div>
        </div>
      </div>
    );
  }

  switch (currentStep) {
    case 1:
      return (
        <div>
          {renderServiceTabs()}
          {renderServiceSelection()}
        </div>
      );
    case 2:
      return renderBookingForm();
    case 3:
      return renderPayment();
    case 4:
      return renderSuccess();
    default:
      return (
        <div>
          {renderServiceTabs()}
          {renderServiceSelection()}
        </div>
      );
  }
};

export default ServiceBookingFlow;

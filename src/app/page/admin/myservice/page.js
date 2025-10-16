"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  Eye,
  Search,
  Filter,
  AlertTriangle,
  Check,
  AlertCircle,
} from "lucide-react";
import axios from "axios";

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddConfirmModal, setShowAddConfirmModal] = useState(false);
  const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentService, setCurrentService] = useState(null);
  const [deleteServiceId, setDeleteServiceId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [modalMessage, setModalMessage] = useState("");
  const [formData, setFormData] = useState({
    serviceType: "",
    name: "",
    priceOptions: [{ option: "", price: "" }],
    image: "",
  });

  // API Base URL
  const API_BASE = "/api/services";

  // Show success modal
  const showSuccessMessage = (message) => {
    setModalMessage(message);
    setShowSuccessModal(true);
  };

  // Show error modal
  const showErrorMessage = (message) => {
    setModalMessage(message);
    setShowErrorModal(true);
  };

  // Show validation modal
  const showValidationMessage = (message) => {
    setModalMessage(message);
    setShowValidationModal(true);
  };

  // Fetch all services
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE);
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
      showErrorMessage("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchServices();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      serviceType: "",
      name: "",
      priceOptions: [{ option: "", price: "" }],
      image: "",
    });
    setCurrentService(null);
  };

  // Handle modal opening
  const openModal = (mode, service = null) => {
    setModalMode(mode);
    setCurrentService(service);

    if (mode === "edit" && service) {
      setFormData({
        serviceType: service.serviceType ?? "",
        name: service.name ?? "",
        priceOptions: service.priceOptions?.map((p) => ({
          option: p.option ?? "",
          price: p.price ?? "",
        })) ?? [{ option: "", price: "" }],
        image: service.image ?? "",
      });
    } else if (mode === "add") {
      resetForm();
    }

    setShowModal(true);
  };

  // Handle delete modal
  const openDeleteModal = (serviceId) => {
    setDeleteServiceId(serviceId);
    setShowDeleteModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle price options changes
  const handlePriceOptionChange = (index, field, value) => {
    const newPriceOptions = [...formData.priceOptions];
    newPriceOptions[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      priceOptions: newPriceOptions,
    }));
  };

  // Add new price option
  const addPriceOption = () => {
    setFormData((prev) => ({
      ...prev,
      priceOptions: [...prev.priceOptions, { option: "", price: "" }],
    }));
  };

  // Remove price option
  const removePriceOption = (index) => {
    if (formData.priceOptions.length > 1) {
      const newPriceOptions = formData.priceOptions.filter(
        (_, i) => i !== index
      );
      setFormData((prev) => ({
        ...prev,
        priceOptions: newPriceOptions,
      }));
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          image: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Add Service button click (show confirmation modal)
  const handleAddService = () => {
    if (
      !formData.serviceType ||
      !formData.name ||
      !formData.priceOptions.some((p) => p.option && p.price)
    ) {
      showValidationMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    setShowAddConfirmModal(true);
  };

  // Handle Edit Service button click (show confirmation modal)
  const handleEditService = () => {
    if (
      !formData.serviceType ||
      !formData.name ||
      !formData.priceOptions.some((p) => p.option && p.price)
    ) {
      showValidationMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    setShowEditConfirmModal(true);
  };

  // Confirm and execute add service
  const confirmAddService = async () => {
    try {
      const serviceData = {
        serviceType: formData.serviceType,
        name: formData.name,
        priceOptions: formData.priceOptions.filter((p) => p.option && p.price),
        image: formData.image || "",
      };

      await axios.post(API_BASE, serviceData);
      await fetchServices();
      setShowModal(false);
      setShowAddConfirmModal(false);
      resetForm();
      showSuccessMessage("เพิ่มบริการสำเร็จ");
    } catch (error) {
      console.error("Error adding service:", error);
      setShowAddConfirmModal(false);
      showErrorMessage("เกิดข้อผิดพลาดในการเพิ่มบริการ");
    }
  };

  // Confirm and execute edit service
  const confirmEditService = async () => {
    if (!currentService?._id) return;

    try {
      const serviceData = {
        serviceType: formData.serviceType,
        name: formData.name,
        priceOptions: formData.priceOptions.filter((p) => p.option && p.price),
        image: formData.image || "",
      };

      await axios.patch(`${API_BASE}/${currentService._id}`, serviceData);
      await fetchServices();
      setShowModal(false);
      setShowEditConfirmModal(false);
      resetForm();
      showSuccessMessage("แก้ไขบริการสำเร็จ");
    } catch (error) {
      console.error("Error editing service:", error);
      setShowEditConfirmModal(false);
      showErrorMessage("เกิดข้อผิดพลาดในการแก้ไขบริการ");
    }
  };

  // Delete service
  const deleteService = async () => {
    if (!deleteServiceId) return;

    try {
      await axios.delete(`${API_BASE}/${deleteServiceId}`);
      await fetchServices();
      setShowDeleteModal(false);
      setDeleteServiceId(null);
      showSuccessMessage("ลบบริการสำเร็จ");
    } catch (error) {
      console.error("Error deleting service:", error);
      setShowDeleteModal(false);
      showErrorMessage("เกิดข้อผิดพลาดในการลบบริการ");
    }
  };

  // Filter services
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "all" || service.serviceType === filterType;
    return matchesSearch && matchesFilter;
  });

  // Get unique service types for filter
  const serviceTypes = [...new Set(services.map((s) => s.serviceType))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">จัดการบริการ</h1>
            <button
              onClick={() => openModal("add")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มบริการใหม่</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="ค้นหาบริการ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400 w-4 h-4" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">ทุกประเภท</option>
                {serviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service._id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                {service.image && (
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {service.serviceType}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => openModal("view", service)}
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                        title="ดูรายละเอียด"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openModal("edit", service)}
                        className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                        title="แก้ไข"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(service._id)}
                        className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                        title="ลบ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  <div className="space-y-1">
                    {service.priceOptions?.slice(0, 2).map((option, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{option.option}</span>
                        <span className="font-semibold text-gray-900">
                          {option.price} ฿
                        </span>
                      </div>
                    ))}
                    {service.priceOptions?.length > 2 && (
                      <div className="text-xs text-gray-500">
                        และอีก {service.priceOptions.length - 2} ตัวเลือก
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredServices.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-600">ไม่พบบริการที่ค้นหา</p>
          </div>
        )}
      </div>

      {/* Main Modal (Add/Edit/View) */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {modalMode === "add"
                    ? "เพิ่มบริการใหม่"
                    : modalMode === "edit"
                    ? "แก้ไขบริการ"
                    : "ดูข้อมูลบริการ"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Service Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ประเภทบริการ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    disabled={modalMode === "view"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="ระบุประเภทของบริการ"
                  />
                </div>

                {/* Service Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อบริการ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={modalMode === "view"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="ระบุชื่อของบริการ"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    รูปภาพ
                  </label>
                  {modalMode !== "view" && (
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200 flex items-center space-x-2 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        <span>เลือกรูปภาพ</span>
                      </label>
                    </div>
                  )}
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg border"
                    />
                  )}
                </div>

                {/* Price Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ตัวเลือกราคา <span className="text-red-500">*</span>
                  </label>
                  {formData.priceOptions.map((option, index) => (
                    <div key={index} className="flex space-x-2 mb-3">
                      <input
                        type="text"
                        placeholder="ระบุรายละเอียด"
                        value={option.option ?? ""} // แก้ตรงนี้
                        onChange={(e) =>
                          handlePriceOptionChange(
                            index,
                            "option",
                            e.target.value
                          )
                        }
                        disabled={modalMode === "view"}
                        className="w-1/2 px-2 py-1 border rounded"
                      />
                      <input
                        type="number"
                        placeholder="ราคา"
                        value={option.price ?? ""} // แก้ตรงนี้
                        onChange={(e) =>
                          handlePriceOptionChange(
                            index,
                            "price",
                            e.target.value
                          )
                        }
                        disabled={modalMode === "view"}
                        className="w-1/2 px-2 py-1 border rounded"
                      />
                      {modalMode !== "view" && (
                        <button
                          type="button"
                          onClick={() => removePriceOption(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  {modalMode !== "view" && (
                    <button
                      type="button"
                      onClick={addPriceOption}
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>เพิ่มตัวเลือกราคา</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 mt-8 pt-4 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {modalMode === "view" ? "ปิด" : "ยกเลิก"}
                </button>
                {modalMode === "add" && (
                  <button
                    onClick={handleAddService}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>เพิ่มบริการ</span>
                  </button>
                )}
                {modalMode === "edit" && (
                  <button
                    onClick={handleEditService}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>บันทึกการแก้ไข</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Confirmation Modal */}
      {showAddConfirmModal && (
        <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                ยืนยันการเพิ่มบริการ
              </h3>
              <p className="text-gray-600 text-center mb-6">
                คุณต้องการเพิ่มบริการ "{formData.name}" ใช่หรือไม่?
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddConfirmModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmAddService}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>ยืนยัน</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Confirmation Modal */}
      {showEditConfirmModal && (
        <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                  <Edit className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                ยืนยันการแก้ไขบริการ
              </h3>
              <p className="text-gray-600 text-center mb-6">
                คุณต้องการบันทึกการแก้ไขบริการ "{formData.name}" ใช่หรือไม่?
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEditConfirmModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmEditService}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>ยืนยัน</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-lg  bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                ยืนยันการลบบริการ
              </h3>
              <p className="text-gray-600 text-center mb-6">
                คุณแน่ใจหรือไม่ที่จะลบบริการนี้?
                การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={deleteService}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>ลบบริการ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 backdrop-blur-lg  bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                สำเร็จ
              </h3>
              <p className="text-gray-600 text-center mb-6">{modalMessage}</p>

              <div className="flex justify-center">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>ตกลง</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 backdrop-blur-lg  bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                เกิดข้อผิดพลาด
              </h3>
              <p className="text-gray-600 text-center mb-6">{modalMessage}</p>

              <div className="flex justify-center">
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>ปิด</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                ข้อมูลไม่ครบถ้วน
              </h3>
              <p className="text-gray-600 text-center mb-6">{modalMessage}</p>

              <div className="flex justify-center">
                <button
                  onClick={() => setShowValidationModal(false)}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center space-x-2 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>ตกลง</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;

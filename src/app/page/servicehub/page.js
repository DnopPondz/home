"use client"

import React, { useState } from 'react';
import { Search, ChevronDown, Star, MapPin } from 'lucide-react';
import Image from 'next/image';

const ServiceHub = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('บริการทั้งหมด');
  const [priceRange, setPriceRange] = useState('0-2000฿');
  const [sortBy, setSortBy] = useState('ตามลำดับคะแนน (Ascending)');

  const services = [
    {
      id: 1,
      title: 'ทำความสะอาดทั่วไป',
      category: 'บริการทั่วไป',
      price: '500.00 ฿',
      rating: 4.8,
      reviews: 245,
      image: '/service/service-1.jpg',
      isPopular: true
    },
    {
      id: 2,
      title: 'ล้างแอร์',
      category: 'บริการทั่วไป',
      price: '500.00 - 1,000.00 ฿',
      rating: 4.9,
      reviews: 189,
      image: '/service/service-2.jpg',
      isPopular: false
    },
    {
      id: 3,
      title: 'ซ่อมเครื่องซักผ้า',
      category: 'บริการทั่วไป',
      price: '500.00 ฿',
      rating: 4.7,
      reviews: 321,
      image: '/service/service-3.jpg',
      isPopular: true
    },
    
  ];

  const ServiceCard = ({ service }) => (
    <div className="w-[343px] h-[370px] flex flex-col border-gray-300 border rounded-lg bg-white shadow-sm">
      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center rounded-t-lg overflow-hidden">
        <div className="text-blue-600 font-medium text-lg">
          <Image
                            src={service.image} 
                            alt="alt"
                            width={1000}
                            height={1000}
                            className=""
                          />
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-[#e7eeff] text-blue-800 text-sm rounded-lg">
            {service.category}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex-1">
          {service.title}
        </h3>
        
        <div className="flex items-center gap-2 mb-4 text-gray-600">
          
          <span className="text-sm flex justify-center items-center gap-2">
            <Image
                            src="/home-img/vector.jpg"
                            alt="alt"
                            width={16}
                            height={16}
                            className=""
                          />{" "}ค่าบริการประมาณ {service.price}
          </span>
        </div>
        
        <button className="text-blue-500 underline text-left hover:text-blue-700 font-medium">
          เลือกบริการ
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-4">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            บริการของเรา
          </h1>
          <p className="text-lg md:text-xl mb-2">
            ซ่อมเครื่องใช้ไฟฟ้า ซ่อมแอร์ ทำความสะอาดบ้าน และอื่น ๆ อีกมากมาย 

          </p>
          <p className="text-base md:text-lg opacity-90">
            โดยพนักงานแม่บ้าน และช่างมืออาชีพ
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ค้นหาบริการ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>บริการทั้งหมด</option>
                  <option>บริการทั่วไป</option>
                  <option>บริการซ่อมแซม</option>
                  <option>บริการติดตั้ง</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>

              <div className="relative">
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>0-2000฿</option>
                  <option>0-500฿</option>
                  <option>500-1000฿</option>
                  <option>1000-2000฿</option>
                  <option>2000฿+</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>ตามลำดับคะแนน (Ascending)</option>
                  <option>ตามลำดับคะแนน (Descending)</option>
                  <option>ราคาต่ำ - สูง</option>
                  <option>ราคาสูง - ต่ำ</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>

              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                ค้นหา
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>

      {/* Load More Button */}
      <div className="text-center pb-12">
        <button className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium">
          โหลดเพิ่มเติม
        </button>
      </div>
    </div>
  );
};

export default ServiceHub;
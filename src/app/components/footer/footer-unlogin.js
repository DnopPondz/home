"use client";

import Image from "next/image";

const FooterUnLoginPage = () => {
  return (
    <div className="w-full">
      {/* Section 1: Job Recruitment */}
      <div className="w-full h-full bg-blue-600">
        <div className="flex flex-col md:flex-row text-white w-full max-w-7xl mx-auto">
          {/* Image Container */}
          <div className="w-full md:w-1/2 lg:w-2/5">
            <Image
              src="/footer/tool.jpg"
              alt="Tools"
              width={1000}
              height={750}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content Container */}
          <div className="w-full md:w-1/2 lg:w-3/5 p-5 md:p-8 lg:p-12 xl:p-16 flex flex-col justify-center">
            <div className="flex flex-col gap-4 md:gap-6 lg:gap-8">
              <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium leading-tight">
                มาร่วมเป็นพนักงาน <br />
                กับ HomeServices
              </h1>
              <p className="text-sm md:text-base lg:text-lg text-blue-100 leading-relaxed">
                เข้ารับการฝึกอบรมที่ได้มาตรฐาน ฟรี! <br />
                และยังได้รับค่าตอบแทนที่มากขึ้นกว่าเดิม
              </p>
              <p className="text-base md:text-lg lg:text-xl xl:text-2xl font-medium">
                ติดต่อมาที่อีเมล: job@homeservices.com
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Company Information */}
      <div className="w-full h-full bg-white flex justify-center items-center ">
        <div className="w-full flex justify-center items-center p-5 md:p-8 lg:p-12 ">
          <div className="gap-8 lg:gap-12">
            {/* Logo and Company Info */}
            <div className="flex flex-col md:flex-row justify-start items-start md:justify-center md:items-center gap-10 ">
              <Image
                src="/footer/logo.jpg"
                alt="HomeServices Logo"
                width={250}
                height={50}
                className="w-[200px] md:w-[200px] lg:w-[200px] "
              />
              <div className="flex flex-col gap-4 md:gap-6">
                <h2 className="text-lg md:text-lg lg:text-lg font-medium text-gray-900">
                  บริษัท โฮมเซอร์วิสเซส จำกัด
                </h2>
                <p className="text-sm md:text-sm lg:text-sm text-gray-700 leading-relaxed">
                  126/57 ต.หนองป่าครั่ง อ.เมืองเชียงใหม่ จ.เชียงใหม่
                  50000
                </p>
              </div>

              <div className="flex flex-col justify-center lg:justify-start">
                <div className="flex flex-col gap-4 md:gap-6 text-gray-800">
                  <div className="flex justify-start items-center gap-3 md:gap-4">
                    <Image
                      src="/footer/phone.jpg"
                      alt="Phone"
                      width={20}
                      height={20}
                      className="w-4 md:w-5 lg:w-6 flex-shrink-0"
                    />
                    <span className="text-sm md:text-sm lg:text-sm">
                      097-287-7748
                    </span>
                  </div>
                  <div className="flex justify-start items-center gap-3 md:gap-4">
                    <Image
                      src="/footer/mail.jpg"
                      alt="Email"
                      width={20}
                      height={20}
                      className="w-4 md:w-5 lg:w-6 flex-shrink-0"
                    />
                    <span className="text-sm md:text-sm lg:text-sm">
                      contact@homeservices.com
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Legal Links and Copyright */}
      <div className="w-full h-full bg-gray-100">
        <div className="max-w-7xl mx-auto p-5 md:p-8 lg:p-12">
          <div className="flex flex-col md:flex-row-reverse md:justify-between md:items-center gap-4 md:gap-6">
            {/* Legal Links */}
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 lg:gap-8 text-gray-700">
              <button className="text-left text-sm md:text-base hover:text-gray-900 transition-colors">
                เงื่อนไขและข้อตกลงการใช้งานเว็บไซต์
              </button>
              <button className="text-left text-sm md:text-base hover:text-gray-900 transition-colors">
                นโยบายความเป็นส่วนตัว
              </button>
            </div>

            {/* Copyright */}
            <p className="text-xs md:text-sm text-gray-500 mt-4 md:mt-0">
              copyright © 2021 HomeServices.com All rights reserved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterUnLoginPage;

"use client";

import Image from "next/image";
import FooterUnLoginPage from "./footer/footer-unlogin";

const HomePage = () => {
  return (
    <div className="w-full flex flex-col justify-center items-center ">
      {/* section 1 */}
      <div className="w-full flex justify-center items-center flex-wrap h-[400px] sm:h-[450px] md:h-[500px] lg:h-[580px] xl:h-[595px] bg-[#e7eeff] relative overflow-hidden">
        {/* Content Container */}
        <div className="w-full max-w-screen-xl mx-auto flex flex-col items-start justify-start pt-8 sm:pt-12 md:pt-16 lg:pt-20 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 h-full">

          {/* Main Title */}
          <h1
            className="text-blue-700 font-bold leading-tight mb-2 sm:mb-3 md:mb-4 lg:mb-5
                   text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-4xl
                   max-w-[280px] sm:max-w-[350px] md:max-w-[450px] lg:max-w-[550px] xl:max-w-[700px]
                   pr-4 sm:pr-8 md:pr-12 lg:pr-16"
          >
            เรื่องบ้าน...ให้เราช่วยดูแลคุณ
          </h1>

          {/* Subtitle */}
          <h2
            className="text-black font-sans mb-2 sm:mb-3 md:mb-4 lg:mb-5
                   text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-3xl"
          >
            "สะดวก ราคาคุ้มค่า เชื่อถือได้"
          </h2>

          {/* Description */}
          <p
            className="text-[#6d7589] leading-relaxed mb-4 sm:mb-5 md:mb-6 lg:mb-6
                  text-sm sm:text-lg md:text-xl lg:text-xl xl:text-xl
                  max-w-[260px] sm:max-w-[300px] md:max-w-[350px] lg:max-w-[400px]"
          >
            ซ่อมเครื่องใช้ไฟฟ้า ซ่อมแอร์ <br />
            ทำความสะอาดบ้าน <br />
            โดยพนักงานแม่บ้าน และช่างมืออาชีพ
          </p>

          {/* CTA Button */}
          <button
            className="text-white bg-[#336df2] rounded-lg font-medium transition-all duration-300 hover:bg-blue-600 hover:shadow-lg
                       w-[140px] sm:w-[160px] md:w-[180px] lg:w-[190px] xl:w-[190px]
                       h-9 sm:h-10 md:h-11 lg:h-12 xl:h-12
                       text-xs sm:text-sm md:text-base lg:text-base xl:text-base"
          >
            เช็คราคาบริการ
          </button>
        </div>

        {/* Image Container */}
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src="/home-img/man.png"
            alt="Professional service technician"
            width={327}
            height={320}
            className="absolute bottom-0 h-auto object-contain object-bottom
                 w-[327px] sm:w-[450px] md:w-[550px] lg:w-[650px] xl:w-[700px]
                 right-[-50px] sm:right-8 md:right-12 lg:right-16 xl:right-20
                 max-h-[70%] sm:max-h-[75%] md:max-h-[80%] lg:max-h-[85%] xl:max-h-[90%]"
            priority
            unoptimized
            onError={(e) => {
              console.log("Original image failed, trying alternative paths...");
              // Fallback paths to try
              const fallbackPaths = [
                "/plumber-pointing-lateral_1368-587-removebg-preview-1.png",
                "/home-img/plumber.png",
                "/images/plumber.png",
                "/images/man.png",
                "/assets/man.png",
                "/public/home-img/man.png",
              ];

              // Try next fallback path
              if (!e.target.dataset.fallbackIndex) {
                e.target.dataset.fallbackIndex = "0";
              }

              const currentIndex = parseInt(e.target.dataset.fallbackIndex);
              if (currentIndex < fallbackPaths.length) {
                e.target.src = fallbackPaths[currentIndex];
                e.target.dataset.fallbackIndex = (currentIndex + 1).toString();
              } else {
                // If all fallbacks fail, create a placeholder
                const placeholder = document.createElement("div");
                placeholder.className = `absolute bottom-0 flex items-center justify-center
                                   w-[120px] sm:w-[160px] md:w-[200px] lg:w-[280px] xl:w-[350px]
                                   h-[100px] sm:h-[130px] md:h-[160px] lg:h-[220px] xl:h-[280px]
                                   right-4 sm:right-8 md:right-12 lg:right-16 xl:right-20
                                   bg-gradient-to-t from-blue-50 via-blue-100 to-blue-50
                                   border-2 border-dashed border-blue-300 rounded-2xl`;
                placeholder.innerHTML = `
            <div class="text-center text-blue-500">
              <div class="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-1">🔧</div>
              <div class="text-xs sm:text-sm md:text-base font-semibold text-blue-600">ช่างมืออาชีพ</div>
            </div>
          `;
                e.target.parentNode.replaceChild(placeholder, e.target);
              }
            }}
          />
        </div>
      </div>
      {/* section 2 */}
      <div className="mt-10 mb-10 flex flex-col justify-center items-center gap-7">
        <h1 className="text-blue-950 text-3xl">บริการยอดฮิตของเรา</h1>
        <div className="flex flex-col lg:flex-row flex-wrap  justify-center items-center gap-7">
          {/* service 1 */}
          <div className="w-[343px] h-[370px] flex flex-col border-gray-300 border-1 rounded-lg ">
            <Image
              src="/home-img/service-1.jpg"
              alt="alt"
              width={1920}
              height={1080}
              className="w-full rounded-t-lg"
            />
            <div className="flex justify-start items-center ">
              <p className="w-[100px] p-2 ml-5 mt-3 bg-[#e7eeff] text-blue-800 text-center rounded-xl">
                บริการทั่วไป
              </p>
            </div>
            <p className="pl-5 mt-2 text-xl font-medium">ทำความสะอาดทั่วไป</p>
            <p className="flex flex-row justify-center items-center gap-2 mt-2 text-gray-700 ">
              <Image
                src="/home-img/Vector.jpg"
                alt="alt"
                width={16}
                height={16}
                className=""
              />{" "}
              ค่าบริการประมาณ 500.00 - 1,000.00 ฿
            </p>
            <p className="pl-5 mt-2 text-xl text-blue-500 underline cursor-pointer hover:text-blue-300">
              เลือกบริการ
            </p>
          </div>
          {/* service 2 */}
          <div className="w-[343px] h-[370px] flex flex-col border-gray-300 border-1 rounded-lg ">
            <Image
              src="/home-img/service-2.jpg"
              alt="alt"
              width={1920}
              height={1080}
              className="w-full rounded-t-lg"
            />
            <div className="flex justify-start items-center ">
              <p className="w-[100px] p-2 ml-5 mt-3 bg-[#e7eeff] text-blue-800 text-center rounded-xl">
                บริการทั่วไป
              </p>
            </div>
            <p className="pl-5 mt-2 text-xl font-medium">ล้างแอร์</p>
            <p className="flex flex-row justify-center items-center gap-2 mt-2 text-gray-700 ">
              <Image
                src="/home-img/vector.jpg"
                alt="alt"
                width={16}
                height={16}
                className=""
              />{" "}
              ค่าบริการประมาณ 500.00 - 1,000.00 ฿
            </p>
            <p className="pl-5 mt-2 text-xl text-blue-500 underline cursor-pointer hover:text-blue-300">
              เลือกบริการ
            </p>
          </div>
          {/* service 3 */}
          <div className="w-[343px] h-[370px] flex flex-col border-gray-300 border-1 rounded-lg ">
            <Image
              src="/home-img/service-3.jpg"
              alt="alt"
              width={1920}
              height={1080}
              className="w-full rounded-t-lg"
            />
            <div className="flex justify-start items-center ">
              <p className="w-[100px] p-2 ml-5 mt-3 bg-[#e7eeff] text-blue-800 text-center rounded-xl">
                บริการทั่วไป
              </p>
            </div>
            <p className="pl-5 mt-2 text-xl font-medium">ซ่อมเครื่องใช้ไฟฟ้า</p>
            <p className="flex flex-row justify-center items-center gap-2 mt-2 text-gray-700 ">
              <Image
                src="/home-img/vector.jpg"
                alt="alt"
                width={16}
                height={16}
                className=""
              />{" "}
              ค่าบริการประมาณ 500.00 - 1,000.00 ฿
            </p>
            <p className="pl-5 mt-2 text-xl text-blue-500 underline cursor-pointer hover:text-blue-300">
              เลือกบริการ
            </p>
          </div>
        </div>
        <button className=" w-[160px] h-[50px] bg-blue-500 text-white rounded-xl cursor-pointer hover:bg-blue-300">
          ดูบริการท้ังหมด
        </button>
      </div>

      <FooterUnLoginPage />
    </div>
  );
};

export default HomePage;
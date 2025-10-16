"use client";

import Image from "next/image";
import FooterUnLoginPage from "./footer/footer-unlogin";
import Link from "next/link";

const HomePage = () => {
  return (
    <div className="w-full flex flex-col justify-center items-center ">
      {/* section 1 */}
      <div className="w-full flex justify-center items-center flex-wrap h-[400px] sm:h-[450px] md:h-[500px] lg:h-[580px] xl:h-[595px] 2xl:h-[620px] bg-[#e7eeff] relative overflow-hidden">
        {/* Content Container */}
        <div className="w-full max-w-[1920px] mx-auto flex flex-col items-start justify-start pt-8 sm:pt-12 md:pt-16 lg:pt-20 xl:pt-24 2xl:pt-28 px-5 sm:px-28 lg:px-36 xl:px-48 2xl:px-64 h-full">
          {/* Main Title */}
          <h1
            className="text-blue-700 font-bold leading-tight mb-2 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-6 2xl:mb-7
             text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl 2xl:text-6xl
             max-w-[280px] sm:max-w-[350px] md:max-w-[450px] lg:max-w-[550px] xl:max-w-[700px] 2xl:max-w-[900px]
             pr-4 sm:pr-8 md:pr-12 lg:pr-16 xl:pr-20 2xl:pr-24"
          >
            เรื่องบ้าน...ให้เราช่วยดูแลคุณ
          </h1>

          {/* Subtitle */}
          <h2
            className="text-black font-sans mb-2 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-6 2xl:mb-7
             text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl 2xl:text-5xl"
          >
            "สะดวก ราคาคุ้มค่า เชื่อถือได้"
          </h2>

          {/* Description */}
          <p
            className="text-[#6d7589] leading-relaxed mb-4 sm:mb-5 md:mb-6 lg:mb-6 xl:mb-7 2xl:mb-8
            text-sm sm:text-lg md:text-xl lg:text-xl xl:text-2xl 2xl:text-3xl
            max-w-[260px] sm:max-w-[300px] md:max-w-[350px] lg:max-w-[400px] xl:max-w-[500px] 2xl:max-w-[600px]"
          >
          <br />
            ทำความสะอาดบ้าน <br />
            โดยพนักงานแม่บ้านมืออาชีพ
          </p>

          {/* CTA Button */}
          <button
            className="text-white bg-[#336df2] rounded-lg font-medium transition-all duration-300 hover:bg-blue-600 hover:shadow-lg active:scale-95
                 w-[140px] sm:w-[160px] md:w-[180px] lg:w-[190px] xl:w-[220px] 2xl:w-[250px]
                 h-9 sm:h-10 md:h-11 lg:h-12 xl:h-14 2xl:h-16
                 text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-xl"
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
           w-[327px] sm:w-[450px] md:w-[550px] lg:w-[650px] xl:w-[750px] 2xl:w-[850px]
           right-[-50px] sm:-right-24 md:-right-30 lg:-right-28 xl:-right-38 2xl:right-1/12 3xl:right-2/12
           max-h-[100%] sm:max-h-[75%] md:max-h-[80%] lg:max-h-[85%] xl:max-h-[90%] 2xl:max-h-[95%]"
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
                             w-[120px] sm:w-[160px] md:w-[200px] lg:w-[280px] xl:w-[350px] 2xl:w-[420px]
                             h-[100px] sm:h-[130px] md:h-[160px] lg:h-[220px] xl:h-[280px] 2xl:h-[340px]
                             right-4 sm:right-8 md:right-12 lg:right-16 xl:right-48 2xl:right-64
                             bg-gradient-to-t from-blue-50 via-blue-100 to-blue-50
                             border-2 border-dashed border-blue-300 rounded-2xl`;
                placeholder.innerHTML = `
            <div class="text-center text-blue-500">
              <div class="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl mb-1">🔧</div>
              <div class="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl font-semibold text-blue-600">ช่างมืออาชีพ</div>
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
          <div className="w-[343px] flex flex-col border border-gray-300 rounded-lg">
            <Image
              src="/home-img/service-1.jpg"
              alt="ทำความสะอาดทั่วไป"
              width={1920}
              height={1080}
              className="w-full rounded-t-lg h-[200px] object-cover"
            />
            <div className="flex flex-col flex-1 p-5">
              <p className="inline-block w-[130px] text-center px-3 py-1 bg-[#e7eeff] text-blue-800 text-sm rounded-lg">
                Cleaning-Home
              </p>
              <p className="mt-3 text-xl font-medium">บริการทำความสะอาด-บ้าน</p>
              <p className="flex items-center gap-2 mt-2 text-gray-700">
                <Image
                  src="/home-img/vector.jpg"
                  alt="icon"
                  width={16}
                  height={16}
                />
                ค่าบริการเริ่มต้น 400 ฿
              </p>
              <Link href="/page/servicehub" className="mt-auto">
                <p className="mt-2 text-xl text-blue-500 underline cursor-pointer hover:text-blue-300">
                  เลือกบริการ
                </p>
              </Link>
            </div>
          </div>
          {/* service 2 */}
          <div className="w-[343px] flex flex-col border border-gray-300 rounded-lg">
            <Image
              src="/home-img/service-2.jpg"
              alt="ทำความสะอาดทั่วไป"
              width={1920}
              height={1080}
              className="w-full rounded-t-lg h-[200px] object-cover"
            />
            <div className="flex flex-col flex-1 p-5">
              <p className="inline-block text-center w-[140px] px-3 py-1 bg-[#e7eeff] text-blue-800 text-sm rounded-lg">
                Cleaning-Condo
              </p>
              <p className="mt-3 text-xl font-medium">บริการทำความสะอาด-คอนโด</p>
              <p className="flex items-center gap-2 mt-2 text-gray-700">
                <Image
                  src="/home-img/vector.jpg"
                  alt="icon"
                  width={16}
                  height={16}
                />
                ค่าบริการเริ่มต้น 400 ฿
              </p>
              <Link href="/page/servicehub" className="mt-auto">
                <p className="mt-2 text-xl text-blue-500 underline cursor-pointer hover:text-blue-300">
                  เลือกบริการ
                </p>
              </Link>
            </div>
          </div>
          {/* service 3 */}
          <div className="w-[343px] flex flex-col border border-gray-300 rounded-lg">
            <Image
              src="/home-img/service-3.jpg"
              alt="ทำความสะอาดทั่วไป"
              width={1920}
              height={1080}
              className="w-full rounded-t-lg h-[200px] object-cover"
            />
            <div className="flex flex-col flex-1 p-5">
              <p className="inline-block w-[130px] text-center px-3 py-1 bg-[#e7eeff] text-blue-800 text-sm rounded-lg">
                Cleaning-Hotel
              </p>
              <p className="mt-3 text-xl font-medium">บริการทำความสะอาด-โรงแรม</p>
              <p className="flex items-center gap-2 mt-2 text-gray-700">
                <Image
                  src="/home-img/vector.jpg"
                  alt="icon"
                  width={16}
                  height={16}
                />
                ค่าบริการเริ่มต้น 400 ฿
              </p>
              <Link href="/page/servicehub" className="mt-auto">
                <p className="mt-2 text-xl text-blue-500 underline cursor-pointer hover:text-blue-300">
                  เลือกบริการ
                </p>
              </Link>
            </div>
          </div>
          {/* service 4 */}
          <div className="w-[343px] flex flex-col border border-gray-300 rounded-lg">
            <Image
              src="/home-img/service-4.jpg"
              alt="ทำความสะอาดทั่วไป"
              width={1920}
              height={1080}
              className="w-full rounded-t-lg h-[200px] object-cover"
            />
          <div className="flex flex-col flex-1 p-5">
            <p className="inline-block w-[170px] text-center px-3 py-1 bg-[#e7eeff] text-blue-800 text-sm rounded-lg">
              Cleaning-Restaurant
            </p>
            <p className="mt-3 text-xl font-medium">บริการทำความสะอาด-ร้านอาหาร</p>
              <p className="flex items-center gap-2 mt-2 text-gray-700">
                <Image
                  src="/home-img/vector.jpg"
                  alt="icon"
                  width={16}
                  height={16}
                />
                ค่าบริการเริ่มต้น 400 ฿
              </p>
              <Link href="/page/servicehub" className="mt-auto">
                <p className="mt-2 text-xl text-blue-500 underline cursor-pointer hover:text-blue-300">
                  เลือกบริการ
                </p>
              </Link>
            </div>
          </div>
          
        </div>
        <Link href="/page/servicehub">
          <button className=" w-[160px] h-[50px] bg-blue-500 text-white rounded-xl cursor-pointer hover:bg-blue-300">
            ดูบริการท้ังหมด
          </button>
        </Link>
      </div>

      <FooterUnLoginPage />
    </div>
  );
};

export default HomePage;

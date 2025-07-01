"use client";

import Image from "next/image";

const HomePage = () => {
  return (
    
    <div className="w-full flex flex-col justify-center items-center">
        {/* section 1 */}
      <div className="w-full h-[595px] bg-[#e7eeff] relative">
        <div className=" flex flex-col items-start pt-5  pl-5">
          <h1 className="text-blue-700 text-4xl font-bold pt-5">เรื่องบ้าน...ให้เราช่วยดูแลคุณ</h1>
          <h2 className="text-xl text-black font-sans pt-5">“สะดวก ราคาคุ้มค่า เชื่อถือได้“</h2>
          <p className="text-gl text-[#6d7589]  pt-5">
            ซ่อมเครื่องใช้ไฟฟ้า ซ่อมแอร์ <br />ทำความสะอาดบ้าน <br />โดยพนักงานแม่บ้าน
            และช่างมืออาชีพ
          </p>
          <button className="w-[190px] h-12 text-white bg-[#336df2] mt-5 rounded-lg ">เช็คราคาบริการ</button>
        </div>
        <div className="">
          <Image
            src="/home-img/plumber-pointing-lateral_1368-587-removebg-preview 1.png"
            alt="alt"
            width={327}
            height={320}
            className="w-  absolute right-[-30px] bottom-0 "
          />
        </div>
      </div>

        {/* section 2 */}
      <div className="mt-10">
        <h1 className="mb-5">บริการยอดฮิตของเรา</h1>

        <div className="w-[343px] h-[350px] flex flex-col border-gray-300 border-1 rounded-lg ">
          <Image src="/home-img/service-1.jpg" alt="alt" width={1920} height={1080} className="w-full rounded-t-lg"/>
          <div className="w">
            <p className="pl-5 pt-3 bg-[#e7eeff]">บริการทั่วไป</p>
          </div>
          <p className="pl-5">ทำความสะอาดทั่วไป</p>
          <p className="flex flex-row justify-center items-center gap-2"><Image src="/home-img/Vector.jpg" alt="alt" width={16} height={16} className="" /> ค่าบริการประมาณ 500.00 - 1,000.00 ฿</p>
          <p className="pl-5">เลือกบริการ</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

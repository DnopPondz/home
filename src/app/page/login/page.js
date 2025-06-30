const loginPage = () => {
  return (
    <div className="w-full flex justify-center items-start min-h-screen p-2">
      <div className="w-full max-w-[614px] h-auto min-h-[450px] relative bg-white rounded-lg flex flex-col outline-1 outline-offset-[-1px] outline-gray-300 p-4 sm:p-8">
        
        {/* Title */}
        <div className="text-center text-blue-950 text-2xl sm:text-3xl font-medium font-['Prompt'] leading-[48px] mb-8 sm:mb-16">
          เข้าสู่ระบบ
        </div>
        
        {/* Form Fields */}
        <div className="w-full max-w-96 mx-auto flex flex-col justify-start items-start gap-5 mb-8">
          {/* Email Field */}
          <div className="w-full flex flex-col justify-start items-start gap-1">
            <div className="justify-center">
              <span className="text-zinc-700 text-base font-medium font-['Prompt'] leading-normal">อีเมล</span>
              <span className="text-rose-700 text-base font-medium font-['Prompt'] leading-normal">*</span>
            </div>
            <div className="w-full px-4 py-2.5 bg-white rounded-lg  outline-1 outline-offset-[-1px] outline-gray-300 inline-flex justify-start items-center gap-2.5">
              <input 
                type="email" 
                placeholder="กรุณากรอกอีเมล" 
                className="w-full bg-transparent text-gray-500 text-base font-normal font-['Prompt'] leading-normal outline-none"
              />
            </div>
          </div>
          
          {/* Password Field */}
          <div className="w-full flex flex-col justify-start items-start gap-1">
            <div className="justify-center">
              <span className="text-zinc-700 text-base font-medium font-['Prompt'] leading-normal">รหัสผ่าน</span>
              <span className="text-rose-700 text-base font-medium font-['Prompt'] leading-normal">*</span>
            </div>
            <div className="w-full px-4 py-2.5 bg-white rounded-lg  outline-1 outline-offset-[-1px] outline-gray-300 inline-flex justify-start items-center gap-2.5">
              <input 
                type="password" 
                placeholder="กรุณากรอกรหัสผ่าน" 
                className="w-full bg-transparent text-gray-500 text-base font-normal font-['Prompt'] leading-normal outline-none"
              />
            </div>
          </div>
        </div>
        
        {/* Login Button */}
        <div className="w-full max-w-96 mx-auto mb-8">
          <button className="w-full px-6 py-2.5 bg-blue-600 rounded-lg inline-flex justify-center items-center gap-2 hover:bg-blue-700 transition-colors">
            <div className="text-center justify-center text-white text-base font-medium font-['Prompt'] leading-normal">
              เข้าสู่ระบบ
            </div>
          </button>
        </div>
        
        {/* Divider */}
        <div className="w-full max-w-96 mx-auto inline-flex justify-center items-center gap-2 mb-8">
          <div className="flex-1 items-center h-px bg-gray-400" />
          <div className="text-center justify-start text-gray-500 text-sm font-normal font-['Prompt'] leading-tight px-4">
            หรือลงชื่อเข้าใช้ผ่าน
          </div>
          <div className="flex-1 h-px bg-gray-400" />
        </div>
        
        {/* Register Link */}
        <div className="text-center inline-flex justify-center items-center gap-2 flex-wrap">
          <div className="text-center justify-start text-gray-500 text-sm sm:text-base font-normal font-['Prompt'] leading-normal">
            ยังไม่มีบัญชีผู้ใช้ HomeService?
          </div>
          <button className="text-center justify-center text-blue-600 text-sm sm:text-base font-semibold font-['Prompt'] underline leading-normal hover:text-blue-700 transition-colors cursor-pointer">
            ลงทะเบียน
          </button>
        </div>
        
      </div>
    </div>
  )
}

export default loginPage
const Header = () => {
    return (<>
        <header className="bg-white shadow w-full mx-auto items-center flex justify-between p-3" >
            <div className='Left '>Logo + Location</div>
            <div className='flex items-center justify-between rounded-md px-2 py-1 max-w-3xl w-full h-10'>
                <input type="text" placeholder="Search birthday,wedding car, proposal and More... " className='w-full h-10 rounded-md border-2 border-gray-300 px-4 outline-red-300 border-none bg-gray-100 ' />
            </div>
            <div className='Right'>
                <button className='bg-red-500 text-white px-4 py-2 rounded-md hover:cursor-pointer hover:opacity-70'>Login</button>
            </div>
        </header>
    </>
    )
}
export default Header
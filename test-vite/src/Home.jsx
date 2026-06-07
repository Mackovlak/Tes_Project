import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { FindCase } from './components/model/sc-modal'; // Assuming this is a modal trigger
import { Navigate, useNavigate } from 'react-router-dom'; // Corrected import for useNavigate

export const Home = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    return (
        <div className="relative min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/bg-1.jpg')" }}>
            {/* Header */}
            <header className="absolute top-0 right-0 p-4 w-full flex justify-end items-center z-10">
                <nav>
                    {/* {token ? (
                        <Button
                            className="text-lg md:text-xl px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-md transition-colors duration-200"
                            onClick={() => navigate('/app')}
                        >
                            Dashboard
                        </Button>
                    ) : (
                        <Button
                            className="text-lg md:text-xl px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-md transition-colors duration-200"
                            onClick={() => navigate('/lorem')}
                        >
                            Partner Login
                        </Button>
                    )} */}
                </nav>
            </header>

            {/* Main Content Area */}
            <main className="flex  items-center justify-center min-h-screen  pb-20">
                <div className="     p-6 rounded-lg ">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-emerald-300 leading-tight mb-4 drop-shadow-lg">
                        Tracking Repair and Customer Service
                    </h1>
                    <div className="mb-8">
                        <p className="text-lg md:text-xl text-emerald-100 mb-2">
                            Welcome to our Tracking Repair and Customer Service!
                        </p>
                        <p className="text-lg md:text-xl text-emerald-100">
                            Our system is designed to provide you with the best service experience possible.
                        </p>
                    </div>

                    {/* Feature Cards Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Find Your Case Card */}
                        <Card className="flex flex-col items-center justify-between p-6 bg-white/10 backdrop-blur-md rounded-lg shadow-lg text-center border border-emerald-500 hover:scale-105 transition-transform duration-300  animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
                            <CardHeader className="flex flex-col items-center gap-3 pb-4">
                                <CardTitle className="text-2xl font-semibold text-emerald-100">
                                    Find Your Case
                                </CardTitle>
                                <CardDescription className="text-md text-emerald-200">
                                    Quickly find your case and view all relevant information.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2  items-center justify-center gap-4">
                                {/* <img src="/Find_Case.png" alt="" className='size-40' /> */}

                            </CardContent>
                            <CardFooter>
                                <FindCase /> 
                                
                            </CardFooter>
                        </Card>

                        {/* Login Partner */}
                        <Card className="flex flex-col items-center justify-between p-6 bg-white/10 backdrop-blur-md rounded-lg shadow-lg text-center border border-emerald-500 hover:scale-105 transition-transform duration-300 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out ">
                            <CardHeader className="flex flex-col items-center gap-3 pb-4">
                                <CardTitle className="text-2xl font-semibold text-emerald-100">
                                    Login For Patner
                                </CardTitle>
                                <CardDescription className="text-md text-emerald-200">
                                    log in to join the service center dashboard
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex  items-center justify-center gap-4">
                                {/* <img src="/Patner_Login.png" alt="" className='size-35'/> */}

                            </CardContent>
                            <CardFooter>
                                {token ? (
                                    <Button
                                        className="w-full px-4  text-white bg-green-600 hover:bg-emerald-700 rounded-md shadow-md transition-colors duration-200"
                                        onClick={() => navigate('/app')}
                                    >
                                        Dashboard
                                    </Button>
                                ) : (
                                    <Button
                                        className="w-full px-4 py-2 text-white bg-green-600 hover:bg-emerald-700 rounded-md shadow-md transition-colors duration-200"
                                        onClick={() => navigate('/lorem')}
                                    >
                                        Partner Login
                                    </Button>
                                )}
                                
                            </CardFooter>
                        </Card>

                        {/* Find Nearest Service Center Card */}
                        {/* <Card className="flex flex-col items-center justify-between p-6 bg-white/10 backdrop-blur-md rounded-lg shadow-lg text-center border border-emerald-500 hover:scale-105 transition-transform duration-300">
                            <CardHeader className="flex flex-col items-center gap-3 pb-4">
                                <img className="w-24 h-24 object-contain" src="/NearLoc.png" alt="Nearest Location Icon" />
                                <CardTitle className="text-2xl font-semibold text-emerald-100">
                                    Find Nearest Service Center
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center gap-4">
                                <CardDescription className="text-md text-emerald-200 mb-4">
                                    Locate the closest service center near you for quick assistance.
                                </CardDescription>
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-md shadow" disabled>
                                    Find Center
                                </Button>
                            </CardContent>
                        </Card> */}

                        {/* Give Feedback Card */}
                        {/* <Card className="flex flex-col items-center justify-between p-6 bg-white/10 backdrop-blur-md rounded-lg shadow-lg text-center border border-emerald-500 hover:scale-105 transition-transform duration-300">
                            <CardHeader className="flex flex-col items-center gap-3 pb-4">
                                <img className="w-24 h-24 object-contain" src="/FeedBack.png" alt="Feedback Icon" />
                                <CardTitle className="text-2xl font-semibold text-emerald-100">
                                    Give Feedback
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center gap-4">
                                <CardDescription className="text-md text-emerald-200 mb-4">
                                    Share your experience and help us improve our services.
                                </CardDescription>
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-md shadow" disabled>
                                    Provide Feedback
                                </Button>
                            </CardContent>
                        </Card> */}

                        {/* Tikecting  */}
                         <Card className="flex flex-col items-center justify-between p-6 bg-white/10 backdrop-blur-md rounded-lg shadow-lg text-center border border-emerald-500 hover:scale-105 transition-transform duration-300 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out ">
                            <CardHeader className="flex flex-col items-center gap-3 pb-4">
                                <CardTitle className="text-2xl font-semibold text-emerald-100">
                                    Create Service Ticket
                                </CardTitle>
                                <CardDescription className="text-md text-emerald-200 mb-4">
                                 Generate Ticket For Booking Service in Service Center Or Onsite 
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center gap-4">
                                <Button className="w-full bg-green-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-md shadow" onClick={() => navigate('/generateticket')}>
                                    Generate
                                </Button>
                            </CardContent>
                        </Card> 
 
                    </div>

                    {/* Closing Statement */}
                    {/* <div className="p-4 text-white text-md md:text-lg bg-black/20 rounded-md">
                        <p>
                            We are committed to providing the best service experience for our customers. Our system is designed to streamline the service process, making it easier for you to find the information you need and get the help you deserve.
                        </p>
                    </div> */}
                </div>
                <div className="bg-amber-300">
                    
                </div>
            </main>
            {/* Footer */}
            <footer className="absolute bottom-0 left-0 w-full p-4 bg-emerald-600 text-white text-center">
                <p className="text-sm md:text-md">
                    &copy; {new Date().getFullYear()} Tracking Repair and Customer Service. All rights reserved.
                </p>
            </footer>
        </div>
    );
};

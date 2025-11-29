import { Button } from "./ui/button";
import { Search as SearchIcon } from "lucide-react";
import Container from "./Container";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";

const Hero = () => {
  const [location, setLocation] = useState("");

  return (
    <Container className="mt-8 mb-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
          <div className="p-4 border-r border-gray-200">
            <label className="block text-gray-600 font-medium mb-2">Location</label>
            <div className="flex items-center">
              <Select defaultValue="kedarnath">
                <SelectTrigger className="border-0 focus:ring-0 p-0 h-9">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kedarnath">Select location</SelectItem>
                  <SelectItem value="kedarnath">Kedarnath</SelectItem>
                  <SelectItem value="sonprayag">Sonprayag</SelectItem>
                  <SelectItem value="gaurikund">Gaurikund</SelectItem>
                  <SelectItem value="rudraprayag">Rudraprayag</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-4 border-r border-gray-200">
            <label className="block text-gray-600 font-medium mb-2">Check-in</label>
            <div className="flex items-center">
              <Input
                type="text"
                placeholder="dd-mm-yyyy"
                className="border-0 p-0 h-9 focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="p-4 border-r border-gray-200">
            <label className="block text-gray-600 font-medium mb-2">Check-out</label>
            <div className="flex items-center">
              <Input
                type="text"
                placeholder="dd-mm-yyyy"
                className="border-0 p-0 h-9 focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="p-4 flex flex-col">
            <label className="block text-gray-600 font-medium mb-2">Guests</label>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Select defaultValue="1guest">
                  <SelectTrigger className="border-0 focus:ring-0 p-0 h-9">
                    <SelectValue placeholder="1 Guest" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1guest">1 Guest</SelectItem>
                    <SelectItem value="2guests">2 Guests</SelectItem>
                    <SelectItem value="3guests">3 Guests</SelectItem>
                    <SelectItem value="4guests">4 Guests</SelectItem>
                    <SelectItem value="5guests">5+ Guests</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="bg-[#0071c2] hover:bg-[#005fa3] text-white h-10 ml-2 px-4">
                <SearchIcon className="h-5 w-5 mr-2" />
                Search Stays
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Hero; 
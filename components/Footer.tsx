const Topics = [
  'Markets', 'Technology', 'Crude Processing Studies', 'Shale Oil', 'Opportunity Crudes',
];

const More = [
  'Videos', 'White Papers', 'Resources', 'Events', 'Terms & Conditions',
];

const Services = [
  'Advertise with OpportunityCrudes.com',
  'Register with OpportunityCrudes.com',
];

const BottomLinks = ['Home', 'About', 'Contact', 'Advertise'];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex flex-col">

      {/* Top section */}
      <div className="bg-gray-100 px-10 py-8 grid grid-cols-3 gap-8">
        <div>
          <h2 className="font-bold uppercase text-sm tracking-wide mb-4">Topic</h2>
          <ul className="space-y-2">
            {Topics.map(label => (
              <li key={label} className="text-sm text-gray-700 cursor-pointer hover:text-black">
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-bold uppercase text-sm tracking-wide mb-4">More</h2>
          <ul className="space-y-2">
            {More.map(label => (
              <li key={label} className="text-sm text-gray-700 cursor-pointer hover:text-black">
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-bold uppercase text-sm tracking-wide mb-4">Services</h2>
          <ul className="space-y-2">
            {Services.map(label => (
              <li key={label} className="text-sm text-gray-700 cursor-pointer hover:text-black">
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-black text-white px-10 py-4 flex items-center justify-between">
        <ul className="flex gap-10">
          {BottomLinks.map(label => (
            <li key={label} className="text-sm cursor-pointer hover:text-gray-300">
              {label}
            </li>
          ))}
        </ul>
        <p className="text-sm">Copyright © {currentYear} OpportunityCrudes.com</p>
      </div>

    </footer>
  );
}
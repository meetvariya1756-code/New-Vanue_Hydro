const ITEMS = [
  'FREE SHIPPING',
  'BUY 1 GET 1 FREE',
  'CASH ON DELIVERY',
  'FREE SHIPPING',
  'BUY 1 GET 1 FREE',
  'CASH ON DELIVERY',
  'FREE SHIPPING',
  'BUY 1 GET 1 FREE',
  'CASH ON DELIVERY',
];

export function AnnouncementMarquee() {
  return (
    <div className="vg-announcement-bar" aria-label="Store announcements">
      <div className="vg-announcement-bar__track">
        {/* Render twice so it loops seamlessly */}
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <span key={i} className="vg-announcement-item">
            <span className="vg-announcement-item__diamond" aria-hidden="true" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

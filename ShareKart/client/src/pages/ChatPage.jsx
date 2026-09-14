import React, { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export const ChatPage = ({ onNavigate, onToast }) => {
  const { user } = useAuth();

  // Active filter tab: 'all', 'rental', 'buy', 'lend'
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState("list"); // 'list' or 'chat' for small screens

  // Conversations list
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: "Aarav Patel",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuArjPG6NdKoN2ccE3Sa-HqN8K74xIUkhRWFgBQ0Q37drvdsyixf7qwJCfaNEA4yHeYg8y5EWk3hZL8k6PAukOfE6K9B-XJn6wDmxqZzKyounC394qpk2cf0sjMQFIzNzf3pzePIlRZj7Zm08mlBEBLbphntByA4brZftf1YD6-_VSiyZgRDW4UU-XkBDua_iZOEHIStZV_E8o4ZqnUoxhBakRu0vDBG-Q-xwnMxygpVNlPtOgUtj8pKvQ",
      online: true,
      verified: true,
      lastSeen: "2m ago",
      itemTitle: "Sony Alpha A6400 Kit",
      itemImage:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCxXhFE21KxUD5yxrm5mcn7OX4dDzfCZB-ZEkOe4wEhLTd2WhbJBwLjau-lJt4H96LFfvDxCI_AM0k0GJ5EzN0hSglK0IYFNI_n-R7QsZ76sSBDIc6U3Z6xQYe00gGNs4JWk1wsTOP42XmlhG5kOUAQBdqkyvvQxCoY-ufdxCQIUVjLfORL1VQWOQO8dw31t36Ua1yBRfwKC3GpAp3k6Z8y23ITWgOW8F5solPeEwf21gfIswfByb6XMQ",
      type: "rental",
      escrowAmount: "₹3,500",
      totalRent: "₹2,397",
      unreadCount: 1,
      lastMessage: "Haan bhai, 4 baje tak Sector 7 garden ke paas milte hain",
    },
    {
      id: 2,
      name: "Vikram Singh",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDGYnt5IB5supFTTnrtOH8Q5snBSBid_Q1tt2vpJk3GQ53p6PKbySkQ8vTdPdFkOOZPj9r5TJU3_huYHMT_YmFzJNy-9UtlQzlXIGhy4yPeTxKMhoauMn-WNarpCwhU5lVfsPN9tpx-Im2Jx5pEhW8Zi160IBzj7rAnhHjKDw5bbz6TLnNfjacNOBg4jPDkdrKGXI-gwKx7MxfcT6RcrylYxPXPN9UpKqTGcOupSNIMTGGpdqK9lsg8nw",
      online: false,
      verified: true,
      lastSeen: "Yesterday",
      itemTitle: "Bosch Hammer Drill 800W",
      itemImage:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA3MwnOocyWiZexRTcYF0p-7X91kBdEb9kmojSV52z0kIIOVM-0F2sUxBt9bYXfRwi3w7hz85yR1qyVfgBeotRi7WFY2p8fTT86oaBPUsfpwNc_kMc8KcyC8tzwkFF7ozTYqgJZ-GmOKf9GI4XudEgoknqYITySqOmYD-0KEvlTVFlUCAWDL4g0KwRUlYnYgyXMDidq6m0nzhJM6t1HBlccKH9QSl0andmk8VGJM2vxS91fXJWdT3G2gg",
      type: "rental",
      escrowAmount: "₹1,500",
      totalRent: "₹1,050",
      unreadCount: 0,
      lastMessage: "Deposit UPI se refund ho gaya kya?",
    },
    {
      id: 3,
      name: "Neha Sharma",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAyb2OIyxjEZKuRntqeT5tpfTsfs1zmHJ2pvDSYbNRGjv0HTOrqaPpdf5Ks0HXM72Ywh2ebeRbajyY60QvEB1VnkQlaU7sERUJe5SU1-1E_aiiZG7KBkFd4-IyPDibll8qNa5Oba6IoLkvTv9bfCTKiNTY67WaG8UA0ycDB0kY5sIsHuHsA2k_c9FSBeCkCRGmCCAtdn6vPBY2PNULnvQFETiuHkK7efuJAA2iqa72-OaBUQxW8e_91Kg",
      online: true,
      verified: true,
      lastSeen: "2d ago",
      itemTitle: "Dell Latitude 7490 i7",
      itemImage:
        "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80",
      type: "buy",
      escrowAmount: "₹23,000",
      totalRent: "₹23,000",
      unreadCount: 0,
      lastMessage: "Counter offer sent: ₹23,000",
    },
    {
      id: 4,
      name: "Rajesh Patel",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDtaxJ9y9qz4T5CGODWgKf8HRIrwtvcuxNGWWNe1UMyf7gR7pONbxEIlczzKIiPexD3NO5i9j0B3Vff7FtIYBEuHR864OrdqhnsIXV0yi_hsHsAhb9vBRrgdVsCGOb2emE3c_RZayMAEthq2o4PyO5S04FJ0KuPbmEsoBCUV9drkMCGBfefcsK3v0cbAcnUAkOX1PHtv5HOsj-B1PGTNTNctDvKjj-sMuGpG7yP1UjLtpcNwaBQIjCdOg",
      online: false,
      verified: true,
      lastSeen: "3d ago",
      itemTitle: "Hero Sprint MTB 21-Speed",
      itemImage:
        "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80",
      type: "lend",
      escrowAmount: "₹2,000",
      totalRent: "₹600",
      unreadCount: 0,
      lastMessage: "Bicycle handover completed ✓",
    },
  ]);

  const [selectedContactId, setSelectedContactId] = useState(1);
  const selectedContact =
    conversations.find((c) => c.id === selectedContactId) || conversations[0];

  // Chat message feed
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "them",
      text: "Hello! Main Sector 7 se baat kar raha hoon. Sony Alpha camera body aur 18-135mm lens dono pristine condition me available hain.",
      time: "10:15 AM",
      status: "read",
    },
    {
      id: 2,
      sender: "me",
      text: "Bhai batteries fully charged milengi na? Aur SanDisk extreme card sath me included hai kya?",
      time: "10:18 AM",
      status: "read",
    },
    {
      id: 3,
      sender: "them",
      text: "Haan bhai, 2 genuine NP-FW50 batteries aur 64GB card dono carry case me packed hain. Pickup ke time test kar lena.",
      time: "10:20 AM",
      status: "read",
    },
    {
      id: 4,
      sender: "them",
      isLocation: true,
      title: "Sector 7 Community Park Entrance Gate",
      address: "Near Mother Dairy Booth, Sector 7, Gandhinagar - 382007",
      time: "10:21 AM",
      status: "read",
    },
    {
      id: 5,
      sender: "them",
      text: "Haan bhai, 4 baje tak Sector 7 garden ke paas milte hain. Main wahi gate par milunga.",
      time: "10:22 AM",
      status: "delivered",
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend = inputText) => {
    const text = (
      typeof textToSend === "string" ? textToSend : inputText
    ).trim();
    if (!text) return;

    const newMsg = {
      id: Date.now(),
      sender: "me",
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sent",
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    // Update conversation preview in sidebar
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedContact.id
          ? { ...c, lastMessage: text, unreadCount: 0 }
          : c,
      ),
    );

    // Call API in background
    try {
      await api.sendMessage(selectedContact.id, 1, text);
    } catch {
      // Offline fallback is fine
    }

    // Simulate neighbor response
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replyMsg = {
          id: Date.now() + 1,
          sender: "them",
          text: "Bilkul bhai! Main item ke sath ready hoon. OTP inspection ke baad hi share karna.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "read",
        };
        setMessages((prev) => [...prev, replyMsg]);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedContact.id
              ? { ...c, lastMessage: replyMsg.text }
              : c,
          ),
        );
      }, 1500);
    }, 800);
  };

  const filteredConversations = conversations.filter((c) => {
    const matchesTab =
      activeTab === "all"
        ? true
        : activeTab === "rental"
          ? c.type === "rental"
          : activeTab === "buy"
            ? c.type === "buy"
            : c.type === "lend";
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.itemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="w-full flex flex-col">
      {/* Top Escrow Bar */}
      <div className="w-full bg-surface-container-low py-space-12 px-space-16 rounded-xl shadow-sm mb-space-16 flex flex-wrap items-center justify-between gap-space-12 border border-outline-variant/40">
        <div className="flex items-center gap-space-8">
          <span className="material-symbols-outlined text-secondary text-[24px]">
            verified_user
          </span>
          <div className="flex flex-col">
            <span className="font-label-bold text-label-bold text-on-surface">
              P2P Encrypted Escrow Workspace
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Payments, conversations & handovers are safeguarded under
              Sharekart Shield
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-16">
          <div className="flex items-center gap-space-4 text-secondary font-label-bold text-label-bold bg-secondary-container/40 px-space-8 py-space-4 rounded border border-secondary-container/60">
            <span className="material-symbols-outlined text-[16px]">
              lock_clock
            </span>
            <span>Escrow Active: {selectedContact.escrowAmount}</span>
          </div>
          <div className="hidden md:flex items-center gap-space-4 text-on-surface-variant font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-[16px] text-secondary">
              security
            </span>
            <span>Aadhaar eKYC Verified Session</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Chat Grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-space-16 bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/50 overflow-hidden h-[calc(100vh-175px)] sm:h-[calc(100vh-200px)] min-h-[560px] max-h-[820px]">
        {/* LEFT COLUMN: CONVERSATIONS LIST (4 cols) */}
        <section
          className={`${mobileView === "list" ? "flex" : "hidden"} lg:flex lg:col-span-4 bg-surface-container-lowest flex-col border-r border-outline-variant/40 h-full overflow-hidden`}
        >
          {/* Search & Status Header */}
          <div className="p-space-16 bg-surface-container-lowest flex flex-col gap-space-12 shadow-xs border-b border-outline-variant/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-8">
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Messages
                </span>
                <span className="bg-secondary text-on-secondary font-badge text-badge px-space-6 py-0.5 rounded-full">
                  {conversations.length}
                </span>
              </div>
              <button
                className="p-space-6 hover:bg-surface-container-low rounded-full transition-colors text-on-surface-variant cursor-pointer"
                title="Chat Settings"
              >
                <span className="material-symbols-outlined text-[20px]">
                  tune
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-space-12 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                id="chatSearchInput"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats, verified neighbors, items..."
                className="w-full pl-10 pr-space-12 py-space-8 bg-surface-container-low rounded font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:bg-surface-container-lowest focus:ring-1 focus:ring-secondary transition-all outline-none border border-transparent focus:border-secondary"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-space-6 overflow-x-auto scrollbar-none pb-space-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-space-12 py-space-4 rounded font-label-bold text-label-bold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === "all"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                All ({conversations.length})
              </button>
              <button
                onClick={() => setActiveTab("rental")}
                className={`px-space-12 py-space-4 rounded font-label-bold text-label-bold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === "rental"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                Active Rentals (2)
              </button>
              <button
                onClick={() => setActiveTab("buy")}
                className={`px-space-12 py-space-4 rounded font-label-bold text-label-bold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === "buy"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                Buying (1)
              </button>
              <button
                onClick={() => setActiveTab("lend")}
                className={`px-space-12 py-space-4 rounded font-label-bold text-label-bold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === "lend"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                Lending (1)
              </button>
            </div>
          </div>

          {/* Conversations Feed */}
          <div className="flex-1 overflow-y-auto flex flex-col p-space-8 gap-space-4">
            {filteredConversations.map((c) => {
              const isSelected = c.id === selectedContact.id;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedContactId(c.id);
                    setMobileView("chat");
                  }}
                  className={`relative flex items-start gap-space-12 p-space-12 rounded-xl transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-surface-container-high border-outline-variant/60 shadow-xs"
                      : "bg-transparent border-transparent hover:bg-surface-container-low"
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {c.online && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-secondary rounded-full ring-2 ring-surface-container-lowest"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-space-4 mb-0.5">
                      <div className="flex items-center gap-space-4 truncate">
                        <span className="font-label-bold text-label-bold text-on-surface truncate">
                          {c.name}
                        </span>
                        {c.verified && (
                          <span
                            className="material-symbols-outlined text-secondary text-[15px]"
                            title="Aadhaar Verified Citizen"
                          >
                            verified
                          </span>
                        )}
                      </div>
                      <span className="font-body-sm text-body-sm text-secondary font-semibold shrink-0">
                        {c.lastSeen}
                      </span>
                    </div>

                    <div className="flex items-center gap-space-6 mb-1">
                      <span
                        className={`font-badge text-badge px-space-4 py-0.5 rounded flex items-center gap-1 shrink-0 ${
                          c.type === "rental"
                            ? "bg-secondary-container/60 text-on-secondary-container"
                            : "bg-primary-container text-on-primary-container"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[11px]">
                          schedule
                        </span>
                        {c.type === "rental"
                          ? "Rental"
                          : c.type === "buy"
                            ? "Direct Sale"
                            : "Lending"}
                      </span>
                      <span className="font-label-bold text-label-bold text-on-surface-variant truncate">
                        {c.itemTitle}
                      </span>
                    </div>

                    <p className="font-body-sm text-body-sm text-on-surface truncate">
                      {c.lastMessage}
                    </p>
                  </div>

                  {c.unreadCount > 0 && (
                    <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                      <span className="w-5 h-5 bg-secondary text-on-secondary rounded-full flex items-center justify-center font-badge text-badge">
                        {c.unreadCount}
                      </span>
                      <span className="material-symbols-outlined text-secondary text-[14px]">
                        done_all
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Trust Assurance Box at bottom of left panel */}
          <div className="p-space-12 m-space-8 bg-surface-container-low rounded-xl flex items-center gap-space-8 border border-outline-variant/40">
            <span className="material-symbols-outlined text-secondary text-[22px] shrink-0">
              shield
            </span>
            <div className="flex flex-col">
              <span className="font-badge text-badge text-on-surface uppercase tracking-wider font-bold">
                Sharekart Masked Calling
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant leading-tight">
                Your phone number is always hidden across all calls & chats.
              </span>
            </div>
          </div>
        </section>

        {/* RIGHT MAIN COLUMN: ACTIVE CHAT WORKSPACE (8 cols) */}
        <main
          className={`${mobileView === "chat" ? "flex" : "hidden"} lg:flex lg:col-span-8 bg-surface-container-low flex-col justify-between h-full overflow-hidden`}
        >
          {/* Top Conversation Header */}
          <div className="p-3 sm:p-space-16 bg-surface-container-lowest flex flex-wrap items-center justify-between gap-2 sm:gap-space-12 shadow-xs border-b border-outline-variant/40 shrink-0">
            <div className="flex items-center gap-2 sm:gap-space-12">
              {/* Mobile Back Button */}
              <button
                onClick={() => setMobileView("list")}
                className="lg:hidden p-1.5 -ml-1 text-on-surface hover:bg-surface-container-low rounded-full transition-colors flex items-center justify-center cursor-pointer"
                title="Back to conversations"
                aria-label="Back to conversations"
              >
                <span className="material-symbols-outlined text-[20px]">
                  arrow_back
                </span>
              </button>

              <div className="relative shrink-0">
                <img
                  src={selectedContact.avatar}
                  alt={selectedContact.name}
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-secondary"
                />
                {selectedContact.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-secondary rounded-full ring-2 ring-surface-container-lowest"></span>
                )}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2 sm:gap-space-6">
                  <span className="font-headline-sm text-sm sm:text-headline-sm text-on-surface font-bold truncate">
                    {selectedContact.name}
                  </span>
                  <span className="inline-flex items-center gap-0.5 bg-secondary-container/50 text-on-secondary-container px-1.5 sm:px-space-6 py-0.5 rounded font-badge text-[10px] sm:text-badge">
                    <span className="material-symbols-outlined text-[11px] sm:text-[12px]">
                      verified
                    </span>{" "}
                    Aadhaar Verified
                  </span>
                </div>
                <div className="flex items-center gap-space-8 text-body-sm font-body-sm text-on-surface-variant">
                  <span className="flex items-center gap-1 text-secondary font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    Online
                  </span>
                  <span>•</span>
                  <span>Gandhinagar, Sector 7</span>
                  <span>•</span>
                  <span className="text-on-surface-variant">
                    Replies in ~5m
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-space-8">
              <a
                href="tel:1800742735"
                className="flex items-center gap-space-4 px-space-12 py-space-6 bg-surface-container-low hover:bg-surface-container text-on-surface rounded font-label-bold text-label-bold transition-colors shadow-xs border border-outline-variant/40"
                title="Masked VoIP or Phone Rail"
              >
                <span className="material-symbols-outlined text-secondary text-[18px]">
                  call
                </span>
                <span className="hidden sm:inline">Masked Call</span>
              </a>

              <button
                onClick={() => onNavigate("handover-pass")}
                className="flex items-center gap-space-4 px-space-12 py-space-6 bg-secondary text-on-secondary rounded font-label-bold text-label-bold hover:bg-secondary-container hover:text-on-secondary-container transition-colors shadow-xs cursor-pointer"
                title="Open Rental Handover Pass"
              >
                <span className="material-symbols-outlined text-[18px]">
                  vpn_key
                </span>
                <span className="hidden sm:inline">Handover Pass</span>
              </button>
            </div>
          </div>

          {/* Quick Action Rail & Escrow Item Context Banner */}
          <div className="bg-surface-container-lowest px-space-16 py-space-8 border-b border-outline-variant/30 flex flex-col gap-space-8">
            <div className="flex items-center gap-space-8 overflow-x-auto scrollbar-none pb-1">
              <button
                onClick={() =>
                  handleSendMessage(
                    "Bhai kya hum aaj shaam 4 baje mil sakte hain handover ke liye?",
                  )
                }
                className="flex items-center gap-1 px-space-10 py-1 bg-surface-container text-on-surface text-body-sm font-label-bold rounded-full hover:bg-surface-container-high transition-colors whitespace-nowrap cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px] text-secondary">
                  calendar_today
                </span>
                <span>Schedule Handover</span>
              </button>

              <button
                onClick={() => onNavigate("handover-pass")}
                className="flex items-center gap-1 px-space-10 py-1 bg-secondary-container/50 text-on-secondary-container text-body-sm font-label-bold rounded-full hover:bg-secondary-container transition-colors whitespace-nowrap cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px] text-secondary">
                  verified
                </span>
                <span>Confirm Pickup Pass</span>
              </button>

              <button
                onClick={() =>
                  handleSendMessage("Bhai kya ₹200 ka discount ho sakta hai?")
                }
                className="flex items-center gap-1 px-space-10 py-1 bg-surface-container text-on-surface text-body-sm font-label-bold rounded-full hover:bg-surface-container-high transition-colors whitespace-nowrap cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px] text-secondary">
                  swap_vert
                </span>
                <span>Counter Offer</span>
              </button>

              <button
                onClick={() =>
                  handleSendMessage(
                    "Location: Infocity Gate 2 landmark near Coffee Culture",
                  )
                }
                className="flex items-center gap-1 px-space-10 py-1 bg-surface-container text-on-surface text-body-sm font-label-bold rounded-full hover:bg-surface-container-high transition-colors whitespace-nowrap cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px] text-secondary">
                  share_location
                </span>
                <span>Share Landmark</span>
              </button>
            </div>

            {/* Active Item Context Strip */}
            <div className="flex items-center justify-between bg-surface-container-low p-space-8 rounded-lg">
              <div className="flex items-center gap-space-8">
                <img
                  src={selectedContact.itemImage}
                  alt={selectedContact.itemTitle}
                  className="w-10 h-10 rounded object-cover bg-surface-container"
                />
                <div>
                  <span className="font-label-bold text-label-bold text-on-surface block truncate max-w-xs">
                    {selectedContact.itemTitle}
                  </span>
                  <span className="text-body-sm text-on-surface-variant">
                    3 Days: 24 Oct – 27 Oct • Total: {selectedContact.totalRent}
                  </span>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <span className="text-badge font-badge text-secondary bg-secondary-container/50 px-2 py-0.5 rounded">
                  Deposit: {selectedContact.escrowAmount} Locked
                </span>
              </div>
            </div>
          </div>

          {/* Active Chat Message Timeline */}
          <div className="flex-1 p-space-16 overflow-y-auto flex flex-col gap-space-12">
            {/* Escrow Security Reminder */}
            <div className="self-center bg-surface-container-high/60 text-on-surface-variant text-body-sm px-space-16 py-space-6 rounded-full flex items-center gap-space-6 border border-outline-variant/30 my-space-4">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                lock
              </span>
              <span>
                Encrypted P2P coordination thread. Do not share OTP before
                in-person test.
              </span>
            </div>

            {messages.map((m) => {
              const isMe = m.sender === "me";
              return (
                <div
                  key={m.id}
                  className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${
                    isMe ? "self-end items-end" : "self-start items-start"
                  }`}
                >
                  <div
                    className={`p-space-12 rounded-2xl shadow-xs text-body-md ${
                      isMe
                        ? "bg-secondary text-on-secondary rounded-br-xs"
                        : "bg-surface-container-lowest text-on-surface rounded-bl-xs border border-outline-variant/30"
                    }`}
                  >
                    {m.isLocation ? (
                      <div className="flex flex-col gap-space-6">
                        <div className="flex items-center gap-space-6 font-label-bold">
                          <span className="material-symbols-outlined text-[20px]">
                            location_on
                          </span>
                          <span>{m.title}</span>
                        </div>
                        <p className="text-body-sm opacity-90">{m.address}</p>
                        <a
                          href="https://maps.google.com"
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 text-badge font-bold underline flex items-center gap-1"
                        >
                          Open in Google Maps{" "}
                          <span className="material-symbols-outlined text-[14px]">
                            open_in_new
                          </span>
                        </a>
                      </div>
                    ) : (
                      <p className="leading-relaxed whitespace-pre-wrap">
                        {m.text}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 mt-1 text-badge text-on-surface-variant px-1">
                    <span>{m.time}</span>
                    {isMe && (
                      <span className="material-symbols-outlined text-[14px] text-secondary">
                        {m.status === "read" ? "done_all" : "check"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="self-start flex items-center gap-2 p-space-12 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 text-on-surface-variant text-body-sm">
                <span className="w-2 h-2 rounded-full bg-secondary animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-secondary animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-secondary animate-bounce [animation-delay:0.4s]"></span>
                <span>{selectedContact.name} is typing...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick Reply Suggestion Chips */}
          <div className="px-space-16 py-1 bg-surface-container-lowest flex items-center gap-space-6 overflow-x-auto scrollbar-none border-t border-outline-variant/30">
            {[
              "Haan 4 baje theek hai",
              "Infocity gate par aa raha hoon",
              "Inspection complete ho gaya ✓",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSendMessage(suggestion)}
                className="text-body-sm font-label-bold bg-surface-container-low hover:bg-surface-container text-on-surface px-space-10 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Bottom Message Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-space-12 bg-surface-container-lowest flex items-center gap-space-8 border-t border-outline-variant/40"
          >
            <button
              type="button"
              className="p-space-8 hover:bg-surface-container-low text-on-surface-variant rounded-full transition-colors cursor-pointer"
              title="Attach photo or bill"
              onClick={() => onToast && onToast("Photo attachment simulation")}
            >
              <span className="material-symbols-outlined text-[20px]">
                add_photo_alternate
              </span>
            </button>

            <button
              type="button"
              className="p-space-8 hover:bg-surface-container-low text-on-surface-variant rounded-full transition-colors cursor-pointer"
              title="Record voice note"
              onClick={() => onToast && onToast("Voice note simulation")}
            >
              <span className="material-symbols-outlined text-[20px]">mic</span>
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type message or discuss pickup spot..."
              className="flex-1 bg-surface-container-low px-space-16 py-space-10 rounded-full font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:bg-surface-container-lowest focus:ring-1 focus:ring-secondary transition-all outline-none border border-transparent focus:border-secondary"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center hover:bg-secondary-container hover:text-on-secondary-container transition-colors disabled:opacity-40 disabled:hover:bg-secondary disabled:hover:text-on-secondary cursor-pointer shadow-xs"
              title="Send message"
            >
              <span className="material-symbols-outlined text-[20px]">
                send
              </span>
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};
export { ChatPage as SharekartP2pChatNeighborhoodCoordinationPage };
export default ChatPage;

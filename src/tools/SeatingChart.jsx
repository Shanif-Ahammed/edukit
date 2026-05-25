import React, { useState, useEffect, useRef } from 'react';
import {
  Users, RotateCcw, RotateCw, Edit3, Trash2,
  Printer, X, Compass, LayoutGrid, Circle,
  Grid, Clipboard, ArrowRight, ShieldCheck, Sparkles, Shuffle
} from 'lucide-react';
import { useData } from '../context/DataContext';

const GRID_SIZE = 40;

const ELEMENT_CONFIGS = {
  'single': {
    w: 100, h: 100, seats: 1, type: 'desk', label: 'Single Desk',
    html: (id, namesData = []) => {
      const student = (namesData && namesData[0]) || { name: '', tags: [] };
      return (
        <>
          <div className="sc-desk-surface" style={{ width: '70px', height: '45px', top: '15px', left: '15px', borderRadius: '4px' }}></div>
          <div className="sc-chair-top-view" style={{ bottom: '10px', left: '36px', transform: 'rotate(0deg)' }}></div>
          <div className="sc-student-name-label" id={`label_${id}_0`} style={{ top: '25px', left: '16px', background: student.name ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)' }}>
            <span className="sc-name-text">{student.name || 'Student'}</span>
            <div className="sc-tag-container">
              {(student.tags || []).map((tag, idx) => (
                <div key={idx} className="sc-tag-dot" style={{ backgroundColor: TAG_COLORS[tag] }} title={tag}></div>
              ))}
            </div>
          </div>
        </>
      );
    }
  },
  'square4': {
    w: 200, h: 200, seats: 4, type: 'desk', label: 'Square Table',
    html: (id, namesData = []) => {
      const students = Array.from({ length: 4 }, (_, i) => (namesData && namesData[i]) || { name: '', tags: [] });
      return (
        <>
          <div className="sc-desk-surface" style={{ width: '120px', height: '120px', top: '40px', left: '40px', borderRadius: '6px' }}></div>
          <div className="sc-chair-top-view" style={{ top: '5px', left: '50px', transform: 'rotate(180deg)' }}></div>
          <div className="sc-chair-top-view" style={{ top: '5px', left: '122px', transform: 'rotate(180deg)' }}></div>
          <div className="sc-chair-top-view" style={{ bottom: '5px', left: '50px', transform: 'rotate(0deg)' }}></div>
          <div className="sc-chair-top-view" style={{ bottom: '5px', left: '122px', transform: 'rotate(0deg)' }}></div>

          <div className="sc-student-name-label" id={`label_${id}_0`} style={{ top: '50px', left: '30px', background: students[0].name ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)' }}>
            <span className="sc-name-text">{students[0].name || 'Student 1'}</span>
            <div className="sc-tag-container">
              {(students[0].tags || []).map((tag, idx) => (
                <div key={idx} className="sc-tag-dot" style={{ backgroundColor: TAG_COLORS[tag] }} title={tag}></div>
              ))}
            </div>
          </div>
          <div className="sc-student-name-label" id={`label_${id}_1`} style={{ top: '50px', left: '102px', background: students[1].name ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)' }}>
            <span className="sc-name-text">{students[1].name || 'Student 2'}</span>
            <div className="sc-tag-container">
              {(students[1].tags || []).map((tag, idx) => (
                <div key={idx} className="sc-tag-dot" style={{ backgroundColor: TAG_COLORS[tag] }} title={tag}></div>
              ))}
            </div>
          </div>
          <div className="sc-student-name-label" id={`label_${id}_2`} style={{ bottom: '50px', left: '30px', background: students[2].name ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)' }}>
            <span className="sc-name-text">{students[2].name || 'Student 3'}</span>
            <div className="sc-tag-container">
              {(students[2].tags || []).map((tag, idx) => (
                <div key={idx} className="sc-tag-dot" style={{ backgroundColor: TAG_COLORS[tag] }} title={tag}></div>
              ))}
            </div>
          </div>
          <div className="sc-student-name-label" id={`label_${id}_3`} style={{ bottom: '50px', left: '102px', background: students[3].name ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)' }}>
            <span className="sc-name-text">{students[3].name || 'Student 4'}</span>
            <div className="sc-tag-container">
              {(students[3].tags || []).map((tag, idx) => (
                <div key={idx} className="sc-tag-dot" style={{ backgroundColor: TAG_COLORS[tag] }} title={tag}></div>
              ))}
            </div>
          </div>
        </>
      );
    }
  },
  'circle6': {
    w: 220, h: 220, seats: 6, type: 'desk', label: 'Round Table',
    html: (id, namesData = []) => {
      const students = Array.from({ length: 6 }, (_, i) => (namesData && namesData[i]) || { name: '', tags: [] });
      const angles = [0, 60, 120, 180, 240, 300];
      return (
        <>
          <div className="sc-desk-surface" style={{ width: '140px', height: '140px', top: '40px', left: '40px', borderRadius: '50%' }}></div>
          {angles.map((angle, i) => {
            const rad = (angle - 90) * Math.PI / 180;
            const cx = 110 + 90 * Math.cos(rad);
            const cy = 110 + 90 * Math.sin(rad);
            const nx = 110 + 45 * Math.cos(rad);
            const ny = 110 + 45 * Math.sin(rad);
            let textRot = angle + 90;
            if (textRot > 90 && textRot <= 270) {
              textRot -= 180;
            }

            const student = students[i];
            return (
              <React.Fragment key={i}>
                <div className="sc-chair-top-view" style={{ left: `${cx - 14}px`, top: `${cy - 14}px`, transform: `rotate(${angle + 180}deg)` }}></div>
                <div className="sc-student-name-label" id={`label_${id}_${i}`} style={{ left: `${nx - 34}px`, top: `${ny - 10}px`, transform: `rotate(${textRot}deg)`, background: student.name ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)' }}>
                  <span className="sc-name-text">{student.name || `Student ${i + 1}`}</span>
                  <div className="sc-tag-container">
                    {(student.tags || []).map((tag, idx) => (
                      <div key={idx} className="sc-tag-dot" style={{ backgroundColor: TAG_COLORS[tag] }} title={tag}></div>
                    ))}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </>
      );
    }
  },
  'teacher': {
    w: 160, h: 100, seats: 1, type: 'desk', label: 'Teacher Desk',
    html: (id, namesData = []) => {
      const student = (namesData && namesData[0]) || { name: 'Teacher', tags: [] };
      return (
        <>
          <div className="sc-desk-surface" style={{ width: '120px', height: '50px', top: '15px', left: '20px', borderRadius: '4px', backgroundColor: '#d97706', borderColor: '#92400e' }}></div>
          <div className="sc-chair-top-view" style={{ bottom: '0px', left: '66px', transform: 'rotate(0deg)', backgroundColor: '#374151', borderColor: '#111827' }}></div>
          <div className="sc-student-name-label" id={`label_${id}_0`} style={{ top: '25px', left: '46px', color: '#fff', background: 'rgba(0,0,0,0.6)' }}>
            <span className="sc-name-text">{student.name || 'Teacher'}</span>
            <div className="sc-tag-container">
              {(student.tags || []).map((tag, idx) => (
                <div key={idx} className="sc-tag-dot" style={{ backgroundColor: TAG_COLORS[tag] }}></div>
              ))}
            </div>
          </div>
        </>
      );
    }
  },
  'smartboard': {
    w: 240, h: 30, seats: 0, type: 'feature', label: 'Smartboard',
    html: () => <div className="sc-smartboard-surface">SMARTBOARD</div>
  },
  'door': {
    w: 100, h: 30, seats: 0, type: 'feature', label: 'Entrance Door',
    html: () => (
      <div className="sc-door-surface" style={{
        width: '100%', height: '100%',
        background: '#475569',
        border: '3px dashed #94a3b8',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        color: '#f8fafc',
        fontSize: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        🚪 ENTRANCE DOOR
      </div>
    )
  }
};

const TAG_COLORS = {
  'Emirati': '#10b981',
  'EAL': '#3b82f6',
  'MAGT': '#8b5cf6',
  'Inclusion': '#f97316',
  'Boarding': '#ef4444'
};

const DEFAULT_MOCK_ROSTER = [
  "Alex Mercer", "Sophia Lin", "Elena Rostova", "Marcus Vance",
  "Chloe Sterling", "Liam Gallagher", "Ji-Woo Park", "Maya Patel",
  "Ethan Caldwell", "Zara Ahmed", "Oscar Finch", "Nia Brooks",
  "Lucas Thorne", "Isabella Rossi", "Dante Cruz", "Emma Watson"
];

export default function SeatingChart() {
  const { fileConnected, students, selectedClass, teacherName } = useData();

  const [roster, setRoster] = useState([]);
  const [elements, setElements] = useState([]);
  const [selectedElementId, setSelectedElementId] = useState(null);

  const [scale, setScale] = useState(1);
  const scrollAreaRef = useRef(null);

  // Modal Edit States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeEditId, setActiveEditId] = useState(null);
  const [tempNames, setTempNames] = useState([]);
  const [modalError, setModalError] = useState(null);
  const [printWarning, setPrintWarning] = useState(null);

  // Dynamic A4 Page Scaler to fit the workspace perfectly without scrollbars
  // Uses stable parent container observations to avoid scaled flex feedback loops
  useEffect(() => {
    const container = document.querySelector('.sc-container');
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;

        // The workspace width is the container width minus the 290px sidebar and padding
        const workspaceWidth = width - 290 - 48;
        // The workspace height is the container height minus the top action bar (50px) and padding
        const workspaceHeight = height - 50 - 48;

        const scaleX = workspaceWidth / 1123;
        const scaleY = workspaceHeight / 794;

        // Always fit the page, so take the min scale to prevent overflow in both directions
        const newScale = Math.min(scaleX, scaleY);
        // Cap the scale at 1.0 so it doesn't get unnaturally huge on large displays
        setScale(Math.max(0.2, Math.min(newScale, 1.0)));
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Class and Teacher details local overrides
  const [localClassName, setLocalClassName] = useState("Class 7A");
  const [localTeacherName, setLocalTeacherName] = useState("Mr. Anderson");

  const canvasRef = useRef(null);

  // Filter students to the active class
  const classStudents = students.filter(s => s.className === selectedClass);

  // Synchronise with active class details
  useEffect(() => {
    if (fileConnected && classStudents.length > 0) {
      const names = classStudents.map(s => s.name);
      setRoster(names);
      setLocalClassName(selectedClass);
      setLocalTeacherName(teacherName || "Mr. Anderson");
      
      // Auto assign roster to active elements when class changes
      autoAssignRoster(classStudents, 'smart');
    } else if (!fileConnected) {
      setRoster(DEFAULT_MOCK_ROSTER);
      setLocalClassName("Class 4B - Science");
      setLocalTeacherName("Mr. Anderson");
    }
  }, [selectedClass, fileConnected, students]);

  // Load pre-populated layout on first boot
  useEffect(() => {
    const savedElements = localStorage.getItem('edukit_seating_elements');
    if (savedElements) {
      try {
        setElements(JSON.parse(savedElements));
      } catch (e) {
        console.error("Failed to parse saved seating elements:", e);
      }
    } else {
      // Default initial layout
      const list = fileConnected && classStudents.length > 0 ? classStudents.map(s => s.name) : DEFAULT_MOCK_ROSTER;
      const initialElements = [
        { id: 'el_sb', type: 'smartboard', x: 441, y: 10, rotation: 0, names: [] },
        { id: 'el_teacher', type: 'teacher', x: 481, y: 60, rotation: 0, names: [{ name: teacherName || 'Mr. Anderson', tags: [] }] },
        {
          id: 'el_sq1', type: 'square4', x: 180, y: 180, rotation: 0,
          names: [
            { name: list[0] || 'Alessandro Rossi', tags: ['MAGT'] },
            { name: list[1] || 'Fatima Al Mansoori', tags: ['Emirati'] },
            { name: list[2] || 'Lucas Dubois', tags: ['EAL'] },
            { name: list[3] || 'Zara O\'Connor', tags: ['Inclusion'] }
          ]
        },
        {
          id: 'el_sq2', type: 'square4', x: 742, y: 180, rotation: 0,
          names: [
            { name: list[4] || 'Oliver Schmidt', tags: ['EAL', 'Inclusion'] },
            { name: list[5] || 'Meera Al Shehhi', tags: ['Emirati', 'MAGT'] },
            { name: list[6] || 'Student 3', tags: [] },
            { name: list[7] || 'Student 4', tags: [] }
          ]
        },
        {
          id: 'el_rd1', type: 'circle6', x: 451, y: 380, rotation: 0,
          names: [
            { name: list[8] || 'Student 5', tags: [] },
            { name: list[9] || 'Student 6', tags: [] },
            { name: list[10] || 'Student 7', tags: [] },
            { name: list[11] || 'Student 8', tags: [] },
            { name: list[12] || 'Student 9', tags: [] },
            { name: list[13] || 'Student 10', tags: [] }
          ]
        }
      ];
      setElements(initialElements);
    }
  }, []);

  // Save seating plan layout to localStorage
  useEffect(() => {
    if (elements.length > 0) {
      localStorage.setItem('edukit_seating_elements', JSON.stringify(elements));
    }
  }, [elements]);

  // Smart Layout Suggestion Algorithm
  const autoAssignRoster = (studentList, mode = 'smart') => {
    if (studentList.length === 0) return;

    // 1. Find all student desk elements (excluding teacher desk, smartboard, features)
    const deskElements = elements.filter(el => el.type !== 'smartboard' && el.type !== 'teacher');
    if (deskElements.length === 0) return;

    // 2. Sort elements from front-to-back based on their Y position
    // Desks closer to Y = 0 (closer to smartboard/teacher) get filled first
    const sortedDesks = [...deskElements].sort((a, b) => a.y - b.y);

    // 3. Prepare students list based on selected mode
    let preparedStudents = [];
    if (mode === 'smart') {
      // SEN (Inclusion) students first (to place them in the front seats)
      const inclusion = studentList.filter(s => s.sen);
      const emirati = studentList.filter(s => s.emirati && !s.sen);
      const eal = studentList.filter(s => s.eal && !s.sen && !s.emirati);
      const gifted = studentList.filter(s => s.gifted && !s.sen && !s.emirati && !s.eal);
      const others = studentList.filter(s => !s.sen && !s.emirati && !s.eal && !s.gifted);

      // Mix gender for others
      const males = others.filter(s => s.gender === 'male' || s.gender === 'm');
      const females = others.filter(s => s.gender === 'female' || s.gender === 'f');
      const mixedOthers = [];
      const maxLength = Math.max(males.length, females.length);
      for (let i = 0; i < maxLength; i++) {
        if (females[i]) mixedOthers.push(females[i]);
        if (males[i]) mixedOthers.push(males[i]);
      }

      // Combine order: Inclusion at the front, then Emirati / G&T / EAL, then others mixed
      preparedStudents = [...inclusion, ...gifted, ...emirati, ...eal, ...mixedOthers];
    } else {
      // Random Shuffling
      preparedStudents = [...studentList].sort(() => Math.random() - 0.5);
    }

    // 4. Fill desk slots sequentially
    let studentIndex = 0;
    const updatedElements = elements.map(el => {
      // Keep teacher desk and smartboard unchanged
      if (el.type === 'smartboard') return el;
      if (el.type === 'teacher') {
        return {
          ...el,
          names: [{ name: localTeacherName || 'Mr. Anderson', tags: [] }]
        };
      }

      const config = ELEMENT_CONFIGS[el.type];
      const newNames = Array.from({ length: config.seats }, () => {
        if (studentIndex < preparedStudents.length) {
          const s = preparedStudents[studentIndex++];
          return { name: s.name, tags: s.tags };
        }
        return { name: '', tags: [] };
      });

      return { ...el, names: newNames };
    });

    setElements(updatedElements);
  };

  const snapToGridCenter = (targetX, targetY, w, h, rotation = 0) => {
    let snappedCx = Math.round(targetX / GRID_SIZE) * GRID_SIZE;
    let snappedCy = Math.round(targetY / GRID_SIZE) * GRID_SIZE;

    const isVertical = (rotation % 180 !== 0);
    const effW = isVertical ? h : w;
    const effH = isVertical ? w : h;

    const cWidth = canvasRef.current ? canvasRef.current.clientWidth : 1122;
    const cHeight = canvasRef.current ? canvasRef.current.clientHeight : 600;

    const maxCx = cWidth - effW / 2;
    const maxCy = cHeight - effH / 2;
    const minCx = effW / 2;
    const minCy = effH / 2;

    if (snappedCx < minCx) snappedCx = minCx;
    if (snappedCy < minCy) snappedCy = minCy;
    if (snappedCx > maxCx) snappedCx = maxCx;
    if (snappedCy > maxCy) snappedCy = maxCy;

    return { x: snappedCx - w / 2, y: snappedCy - h / 2 };
  };

  const handleDragStart = (e, type) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', type);
      e.dataTransfer.effectAllowed = 'copy';
    }
  };

  const handleCanvasDragOver = (e) => {
    e.preventDefault();
  };

  const handleCanvasDrop = (e) => {
    e.preventDefault();
    if (!e.dataTransfer) return;
    const type = e.dataTransfer.getData('text/plain');
    if (!type || !ELEMENT_CONFIGS[type]) return;

    const canvasRect = canvasRef.current ? canvasRef.current.getBoundingClientRect() : { left: 0, top: 0 };
    const mouseX = (e.clientX - canvasRect.left) / scale;
    const mouseY = (e.clientY - canvasRect.top) / scale;

    const config = ELEMENT_CONFIGS[type];
    const snapped = snapToGridCenter(mouseX, mouseY, config.w, config.h, 0);

    const newElement = {
      id: 'el_' + Math.random().toString(36).substr(2, 9),
      type,
      x: snapped.x,
      y: snapped.y,
      rotation: 0,
      names: config.seats > 0 ? Array.from({ length: config.seats }, () => ({ name: '', tags: [] })) : []
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
  };

  const handleElementDragStart = (e, el) => {
    if (e.target.closest('.sc-element-controls') || e.target.closest('button')) return;
    if (e.button !== 0) return;

    setSelectedElementId(el.id);

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startX = el.x;
    const startY = el.y;

    const handleMouseMove = (moveEvent) => {
      const dx = (moveEvent.clientX - startMouseX) / scale;
      const dy = (moveEvent.clientY - startMouseY) / scale;

      const nextX = startX + dx;
      const nextY = startY + dy;

      setElements(prev => prev.map(item => {
        if (item.id === el.id) {
          return { ...item, x: nextX, y: nextY };
        }
        return item;
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      setElements(prev => prev.map(item => {
        if (item.id === el.id) {
          const config = ELEMENT_CONFIGS[item.type];
          const snapped = snapToGridCenter(item.x + config.w / 2, item.y + config.h / 2, config.w, config.h, item.rotation);
          return { ...item, x: snapped.x, y: snapped.y };
        }
        return item;
      }));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    e.preventDefault();
  };

  const rotateElement = (e, id, direction) => {
    e.stopPropagation();
    setElements(prev => prev.map(item => {
      if (item.id === id) {
        let currentRot = item.rotation;
        currentRot = (currentRot + (direction * 45)) % 360;
        if (currentRot < 0) currentRot += 360;

        const config = ELEMENT_CONFIGS[item.type];
        const snapped = snapToGridCenter(item.x + config.w / 2, item.y + config.h / 2, config.w, config.h, currentRot);

        return { ...item, rotation: currentRot, x: snapped.x, y: snapped.y };
      }
      return item;
    }));
  };

  const deleteElement = (e, id) => {
    e.stopPropagation();
    setElements(prev => prev.filter(item => item.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const clearCanvas = () => {
    if (window.confirm("Clear current seating plan layout completely?")) {
      setElements([]);
      setSelectedElementId(null);
    }
  };

  const openNameModal = (e, el) => {
    e.stopPropagation();
    setActiveEditId(el.id);
    setModalError(null);

    const config = ELEMENT_CONFIGS[el.type];
    const initialNames = Array.from({ length: config.seats }, (_, i) => {
      return el.names[i] || { name: '', tags: [] };
    });
    setTempNames(initialNames);
    setEditModalOpen(true);
  };

  const handleSeatNameChange = (seatIdx, value) => {
    // Fill student details automatically if matched from roster
    const match = classStudents.find(s => s.name.toLowerCase() === value.toLowerCase());
    
    setTempNames(prev => prev.map((item, idx) => {
      if (idx === seatIdx) {
        return { 
          ...item, 
          name: value,
          tags: match ? match.tags : item.tags
        };
      }
      return item;
    }));
  };

  const handleTagToggle = (seatIdx, tag) => {
    setTempNames(prev => prev.map((item, idx) => {
      if (idx === seatIdx) {
        const hasTag = item.tags.includes(tag);
        let nextTags;
        if (hasTag) {
          nextTags = item.tags.filter(t => t !== tag);
        } else {
          if (item.tags.length >= 4) {
            setModalError("Maximum 4 tags allowed per student.");
            setTimeout(() => setModalError(null), 4000);
            return item;
          }
          nextTags = [...item.tags, tag];
        }
        return { ...item, tags: nextTags };
      }
      return item;
    }));
  };

  const saveNames = () => {
    if (!activeEditId) return;
    setElements(prev => prev.map(item => {
      if (item.id === activeEditId) {
        return { ...item, names: tempNames };
      }
      return item;
    }));
    setEditModalOpen(false);
    setActiveEditId(null);
  };

  const totalSeats = elements.reduce((acc, el) => {
    if (el.type === 'teacher') return acc;
    const config = ELEMENT_CONFIGS[el.type];
    return acc + (config.seats || 0);
  }, 0);

  const handlePrint = () => {
    const types = elements.map(el => el.type);
    const missing = [];
    if (!types.includes('smartboard')) missing.push('Smartboard');
    if (!types.includes('door'))       missing.push('Entrance Door');
    if (!types.includes('teacher'))    missing.push('Teacher Desk');

    if (missing.length > 0) {
      setPrintWarning(`Missing room elements: ${missing.join(', ')}. Please add them before printing.`);
      setTimeout(() => setPrintWarning(null), 6000);
      return;
    }

    setPrintWarning(null);
    setSelectedElementId(null);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (selectedElementId && !e.target.closest('.sc-canvas-element') && !e.target.closest('.sc-toolbar')) {
        setSelectedElementId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [selectedElementId]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>

      {/* Dynamic Style Tag */}
      <style>{`
        .sc-container {
          display: flex;
          height: calc(100vh - 120px);
          overflow: hidden;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          background: var(--bg-app);
        }

        .sc-toolbar {
          width: 290px;
          background-color: var(--bg-sidebar);
          border-right: 1px solid var(--border-color);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          overflow-y: auto;
          flex-shrink: 0;
        }

        .sc-main-workspace {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          background-color: var(--bg-app);
          position: relative;
          min-height: 0;
          height: 100%;
        }

        .sc-top-action-bar {
          height: 50px;
          background-color: var(--bg-sidebar);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 1.5rem;
          flex-shrink: 0;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .sc-scroll-area {
          flex-grow: 1;
          overflow: hidden;
          padding: 1.5rem;
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          position: relative;
        }

        .sc-a4-paper {
          font-family: 'Outfit', 'Inter', system-ui, -apple-system, sans-serif;
          background-color: white;
          width: 297mm;
          height: 210mm;
          box-shadow: var(--shadow-xl);
          display: flex;
          flex-direction: column;
          position: relative;
          flex-shrink: 0;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .sc-paper-header {
          border-bottom: 3px solid #E10031;
          padding: 1rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: white;
          flex-shrink: 0;
          z-index: 10;
        }

        .sc-grid-canvas {
          flex-grow: 1;
          background-color: white;
          background-image: 
              linear-gradient(to right, #f1f5f9 1px, transparent 1px),
              linear-gradient(to bottom, #f1f5f9 1px, transparent 1px);
          background-size: 40px 40px; 
          position: relative;
        }

        .sc-draggable-item {
          cursor: grab;
          user-select: none;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0.6rem 0.8rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          background-color: var(--bg-card);
          color: var(--text-main);
          transition: all 0.2s;
        }
        .sc-draggable-item:hover { 
          background-color: var(--bg-card-hover); 
          border-color: var(--border-color-hover); 
        }
        .sc-draggable-item:active { cursor: grabbing; }

        .sc-canvas-element {
          position: absolute;
          cursor: grab;
          user-select: none;
          transform-origin: center center;
        }
        .sc-canvas-element.dragging { cursor: grabbing; opacity: 0.8; z-index: 100 !important; }
        .sc-canvas-element.selected { z-index: 50; }
        .sc-canvas-element.selected::after {
          content: '';
          position: absolute;
          inset: -4px;
          border: 2px dashed #E10031;
          border-radius: 8px;
          pointer-events: none;
        }

        .sc-desk-surface {
          background-color: #e6b981;
          border: 2px solid #b47b3b;
          box-shadow: inset 0 0 5px rgba(0,0,0,0.1), 0 3px 5px rgba(0,0,0,0.1);
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sc-chair-top-view {
          width: 28px;
          height: 28px;
          background-color: #1a365d;
          border: 2px solid #2b6cb0;
          border-radius: 6px;
          position: absolute;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .sc-chair-top-view::before {
          content: '';
          position: absolute;
          top: -4px; left: -2px; right: -2px;
          height: 7px;
          background-color: #d52b1e;
          border-radius: 4px;
        }

        .sc-student-name-label {
          position: absolute;
          font-size: 10px;
          font-weight: 700;
          color: #1e293b;
          text-align: center;
          width: 68px;
          pointer-events: none;
          background: rgba(255,255,255,0.95);
          padding: 2px 3px;
          border-radius: 4px;
          border-top: 2px solid #E10031;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          box-shadow: 0 1px 3px rgba(225,0,49,0.15);
        }
        .sc-name-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }
        .sc-tag-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 3px;
          min-height: 8px;
          max-width: 100%;
        }
        .sc-tag-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .sc-smartboard-surface {
          width: 100%; height: 100%;
          background: #1a365d;
          border: 3px solid #d52b1e;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          box-shadow: 0 3px 5px rgba(0,0,0,0.1);
        }

        .sc-element-controls {
          display: none;
          position: absolute;
          top: -50px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--bg-sidebar);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          box-shadow: var(--shadow-lg);
          padding: 4px;
          gap: 4px;
          z-index: 1000;
        }
        .sc-canvas-element.selected .sc-element-controls { display: flex; }

        .sc-control-btn {
          background: none; border: none; cursor: pointer;
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-main); font-size: 14px; transition: all 0.2s;
        }
        .sc-control-btn:hover { background-color: var(--bg-card-hover); color: var(--primary); }
        .sc-control-btn.edit:hover { background-color: var(--bg-card-hover); color: var(--success); }
        .sc-control-btn.delete { color: var(--error); }
        .sc-control-btn.delete:hover { background-color: rgba(239, 68, 68, 0.1); }

        .sc-name-modal {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 2000;
          align-items: center;
          justify-content: center;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
        }
        .sc-name-modal.active { display: flex; }

        @media print {
          @page { 
            size: A4 landscape; 
            margin: 0; 
          }
          body, html { 
            width: 100% !important; 
            height: 100% !important; 
            background-color: white !important; 
            margin: 0 !important; 
            padding: 0 !important; 
            overflow: visible !important; 
          }
          .sidebar, aside, header, nav, .print-hidden, .sc-toolbar, .sc-top-action-bar { 
            display: none !important; 
          }
          .app-container {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: 100% !important;
            overflow: visible !important;
          }
          .main-content {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: 100% !important;
            max-width: none !important;
            overflow: visible !important;
          }
          .sc-container {
            border: none !important;
            background: white !important;
            display: block !important;
            width: 100% !important;
            height: 100% !important;
            overflow: visible !important;
          }
          .sc-main-workspace { 
            display: block !important; 
            width: 100% !important; 
            height: 100% !important; 
            padding: 0 !important; 
            margin: 0 !important; 
            background: white !important; 
            overflow: visible !important;
          }
          .sc-scroll-area {
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            width: 100% !important;
            height: 100% !important;
            overflow: visible !important;
          }
          .sc-a4-paper { 
            width: 297mm !important; 
            height: 210mm !important; 
            box-shadow: none !important; 
            border: none !important; 
            margin: 0 !important; 
            transform: none !important; 
            transform-origin: top left !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
          }
          .sc-canvas-element.selected { box-shadow: none; }
          .sc-canvas-element.selected::after { display: none; }
          * { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }
        }
      `}</style>

      {/* Page Header (Not printed) */}
      <div className="print-hidden" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.25rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users style={{ color: '#E10031' }} size={32} />
            Seating Plan Studio
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Design your custom A4 seating plan. Drag desks onto the grid, customize students, or auto-arrange rosters.
          </p>
        </div>
      </div>

      {/* Main Layout Canvas Wrapper */}
      <div className="sc-container">

        {/* Left Side Elements Toolbar */}
        <div className="sc-toolbar print-hidden">
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Compass size={16} style={{ color: '#E10031' }} /> Desk Library
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Drag shape templates onto grid:</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

            <div className="sc-draggable-item" draggable onDragStart={(e) => handleDragStart(e, 'single')}>
              <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ width: '28px', height: '16px', backgroundColor: '#e6b981', border: '1px solid #b47b3b', margin: 'auto' }}></div>
              </div>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block' }}>Single Desk</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>1 student seat</span>
              </div>
            </div>

            <div className="sc-draggable-item" draggable onDragStart={(e) => handleDragStart(e, 'square4')}>
              <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ width: '32px', height: '32px', backgroundColor: '#e6b981', border: '1px solid #b47b3b', borderRadius: '2px', margin: 'auto' }}></div>
              </div>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block' }}>Square Table</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>4 student seats</span>
              </div>
            </div>

            <div className="sc-draggable-item" draggable onDragStart={(e) => handleDragStart(e, 'circle6')}>
              <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ width: '34px', height: '34px', backgroundColor: '#e6b981', border: '1px solid #b47b3b', borderRadius: '50%', margin: 'auto' }}></div>
              </div>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block' }}>Round Table</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>6 student seats</span>
              </div>
            </div>

            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '1rem', display: 'block' }}>Room Elements</span>

            <div className="sc-draggable-item" draggable onDragStart={(e) => handleDragStart(e, 'smartboard')}>
              <div style={{ width: '56px', height: '36px', background: '#cbd5e1', border: '2px solid #475569', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e293b', fontWeight: '800', fontSize: '0.55rem', letterSpacing: '1px', margin: 'auto' }}>
                BOARD
              </div>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block' }}>Smartboard</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Wall feature</span>
              </div>
            </div>

            <div className="sc-draggable-item" draggable onDragStart={(e) => handleDragStart(e, 'door')}>
              <div style={{ width: '56px', height: '36px', background: '#475569', border: '2px dashed #94a3b8', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f8fafc', fontWeight: '800', fontSize: '0.55rem', margin: 'auto' }}>
                🚪 DOOR
              </div>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block' }}>Entrance Door</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Room entrance</span>
              </div>
            </div>

            <div className="sc-draggable-item" draggable onDragStart={(e) => handleDragStart(e, 'teacher')}>
              <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: 'auto' }}>
                <div style={{ width: '36px', height: '14px', backgroundColor: '#d97706', border: '1px solid #92400e', borderRadius: '1px', marginTop: '12px' }}></div>
                <div style={{ width: '12px', height: '8px', backgroundColor: '#374151', borderRadius: '2px', marginTop: '4px' }}></div>
              </div>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block' }}>Teacher Desk</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>1 Teacher slot</span>
              </div>
            </div>

          </div>

          {/* Roster Link Status Block at the very bottom of the sidebar */}
          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <ShieldCheck size={13} style={{ color: fileConnected ? 'var(--success)' : 'var(--warning)' }} />
              Roster: {fileConnected ? (
                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Active iSAMS</span>
              ) : (
                <span style={{ color: 'var(--warning)' }}>Local Mock</span>
              )}
            </div>
          </div>
        </div>

        {/* Right workspace */}
        <div className="sc-main-workspace">

          {/* Top action bar containing Seating Plan controls aligned to the left */}
          <div className="sc-top-action-bar print-hidden" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1.5rem', justifyContent: 'flex-start' }}>
            
            {fileConnected && classStudents.length > 0 && (
              <>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '0.35rem', borderColor: 'var(--border-primary)', color: 'var(--text-main)' }} 
                  onClick={() => autoAssignRoster(classStudents, 'smart')}
                  title="Optimize seating using SISD student profile tags (SEN, Emirati, EAL, MAGT)"
                >
                  <Sparkles size={13} style={{ color: 'var(--primary)' }} /> Smart Seat
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '0.35rem' }} 
                  onClick={() => autoAssignRoster(classStudents, 'random')}
                  title="Randomize student seat assignments"
                >
                  <Shuffle size={13} /> Randomize
                </button>
              </>
            )}

            <div style={{ background: 'rgba(225,0,49,0.07)', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(225,0,49,0.25)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <LayoutGrid size={13} style={{ color: '#E10031' }} />
              <span style={{ fontSize: '0.78rem', color: '#E10031', fontWeight: '700' }}>
                Seats: {totalSeats}
              </span>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ padding: '0.4rem 0.95rem', fontSize: '0.8rem', gap: '0.35rem' }} 
              onClick={handlePrint}
              title="Print seating plan in A4 landscape"
            >
              <Printer size={13} /> Print Plan
            </button>

            <button 
              className="btn btn-secondary" 
              style={{ borderColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '0.35rem' }} 
              onClick={clearCanvas}
              title="Clear all desks from layout"
            >
              <Trash2 size={13} /> Clear Plan
            </button>

            {printWarning && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                background: 'rgba(225,0,49,0.08)',
                border: '1px solid rgba(225,0,49,0.35)',
                borderLeft: '4px solid #E10031',
                borderRadius: '6px',
                padding: '0.3rem 0.6rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#E10031',
                animation: 'fadeIn 0.2s ease'
              }}>
                ⚠️ {printWarning}
              </div>
            )}
          </div>

          {/* Canvas Scroll Area */}
          <div className="sc-scroll-area" ref={scrollAreaRef}>

            {/* Virtual A4landscape paper */}
            <div 
              className="sc-a4-paper" 
              id="a4-paper"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                flexShrink: 0
              }}
            >

              {/* Paper Header (Printed) */}
              <div className="sc-paper-header" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', paddingBottom: '12px' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.03em', textAlign: 'center' }}>
                  Seating Plan
                </h2>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#64748b' }}>Class:</span>
                    <input
                      type="text"
                      value={localClassName}
                      onChange={(e) => setLocalClassName(e.target.value)}
                      placeholder="Class Name"
                      style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1e293b', background: 'transparent', border: 'none', outline: 'none', width: '180px' }}
                      spellCheck="false"
                    />
                  </div>

                  {/* Demographic Legend */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    {Object.entries(TAG_COLORS).map(([tag, color]) => (
                      <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: '700', color: '#64748b' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }}></div> {tag}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#64748b' }}>Teacher:</span>
                    <input
                      type="text"
                      value={localTeacherName}
                      onChange={(e) => setLocalTeacherName(e.target.value)}
                      placeholder="Teacher Name"
                      style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1e293b', background: 'transparent', border: 'none', outline: 'none', width: '150px', textAlign: 'right' }}
                      spellCheck="false"
                    />
                  </div>
                </div>
              </div>

              {/* Placed Elements Area */}
              <div
                className="sc-grid-canvas"
                id="grid-canvas"
                ref={canvasRef}
                onDragOver={handleCanvasDragOver}
                onDrop={handleCanvasDrop}
              >
                <img
                  src="https://www.nordangliaeducation.com/-/media/sisd-dubai/logos/horizontal-logo.png?rev=1e55495ba7364e8a978dd65e1d644f62.png"
                  alt="SISD Watermark"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '380px',
                    opacity: 0.05,
                    pointerEvents: 'none',
                    zIndex: 0,
                    userSelect: 'none'
                  }}
                />

                {elements.map((el) => {
                  const isSelected = selectedElementId === el.id;
                  const config = ELEMENT_CONFIGS[el.type];
                  if (!config) return null;

                  return (
                    <div
                      key={el.id}
                      className={`sc-canvas-element ${isSelected ? 'selected' : ''}`}
                      style={{
                        width: `${config.w}px`,
                        height: `${config.h}px`,
                        left: `${el.x}px`,
                        top: `${el.y}px`,
                        transform: `rotate(${el.rotation}deg)`
                      }}
                      onMouseDown={(e) => handleElementDragStart(e, el)}
                    >
                      {config.html(el.id, el.names)}

                      <div
                        className="sc-element-controls print-hidden"
                        style={{ transform: `translateX(-50%) rotate(${-el.rotation}deg)` }}
                      >
                        <button className="sc-control-btn" title="Rotate L" onClick={(e) => rotateElement(e, el.id, -1)}>
                          <RotateCcw size={13} />
                        </button>
                        <button className="sc-control-btn" title="Rotate R" onClick={(e) => rotateElement(e, el.id, 1)}>
                          <RotateCw size={13} />
                        </button>
                        {config.seats > 0 && (
                          <button className="sc-control-btn edit" title="Edit Seats" onClick={(e) => openNameModal(e, el)}>
                            <Edit3 size={13} />
                          </button>
                        )}
                        <button className="sc-control-btn delete" title="Delete shape" onClick={(e) => deleteElement(e, el.id)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Roster Suggestions autocomplete list */}
      <datalist id="roster-suggestions">
        {fileConnected && roster.map((name, index) => (
          <option key={index} value={name} />
        ))}
      </datalist>

      {/* Roster Seat Assignment Modal */}
      {editModalOpen && (
        <div className={`sc-name-modal active print-hidden`}>
          <div className="glass-panel" style={{ width: '450px', maxWidth: '95%', padding: '2rem', background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xl)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Edit3 size={18} style={{ color: '#E10031' }} /> Seat Assignments
              </h3>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setEditModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '1rem' }}>
                {modalError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '50vh', overflowY: 'auto', paddingRight: '4px', marginBottom: '1.5rem' }}>
              {tempNames.map((student, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderLeft: '3px solid #E10031', borderRadius: '8px' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#E10031', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Seat {i + 1}</label>
                  <input
                    type="text"
                    list="roster-suggestions"
                    value={student.name}
                    onChange={(e) => handleSeatNameChange(i, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                    placeholder="Search roster or enter name..."
                  />

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '4px' }}>
                    {Object.keys(TAG_COLORS).map(tag => {
                      const isChecked = student.tags.includes(tag);
                      return (
                        <label key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-muted)' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTagToggle(i, tag)}
                            style={{ cursor: 'pointer' }}
                          />
                          <span style={{ color: isChecked ? TAG_COLORS[tag] : 'inherit', fontWeight: isChecked ? '700' : 'normal' }}>{tag}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button className="btn btn-primary" style={{ width: '100%', padding: '0.65rem 1rem' }} onClick={saveNames}>
              Save Seat Assignments
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

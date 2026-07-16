import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toast } from 'react-toastify';
import { getPlayerDisplay, gameKey } from '../../utils/chessUtils';
import { MatchFixture } from './MatchFixture';

export const FixturesTab = ({ currentDivision, gameResults, currentRound, setCurrentRound, onPlayerSelect }) => {
  const [showModal, setShowModal] = useState(false);
  const [exportType, setExportType] = useState(null); // 'image' | 'pdf'

  if (!currentDivision || !currentDivision.rounds || currentDivision.rounds.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
        <p className="text-gray-500 font-medium">No rounds or fixtures generated yet for this division.</p>
      </div>
    );
  }

  const activeRoundsList = currentDivision.rounds.filter(r => !r.hidden);

  if (activeRoundsList.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
        <p className="text-gray-500 font-medium">All rounds are currently hidden or archived.</p>
      </div>
    );
  }

  // Ensure currentRound is valid, fallback to first round if not found
  const activeRoundData = activeRoundsList.find(r => r.round === currentRound) || activeRoundsList[0];

  const loadLogo = () => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = '/SS4_logo.png';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
    });
  };

  const downloadAsImage = async (round) => {
    const element = round === 'all' 
      ? document.getElementById('export-fixtures-list') 
      : document.getElementById(`export-fixture-round-${round}`);

    if (!element) {
      toast.error('Fixtures element not found');
      return;
    }

    const toastId = toast.loading(
      `Generating premium image for ${round === 'all' ? 'All Rounds' : `Round ${round}`}...`,
      { theme: 'dark' }
    );

    try {
      const originalStyle = element.getAttribute('style') || '';
      
      // Temporarily expand container only if exporting All Rounds (to capture full scroll height/width)
      if (round === 'all') {
        element.style.overflow = 'visible';
        element.style.display = 'flex';
        element.style.flexDirection = 'column';
        element.style.gap = '24px';
        element.style.width = 'max-content';
        element.style.padding = '32px';
        element.style.background = '#FFFFFF';
      } else {
        element.style.padding = '24px';
        element.style.borderRadius = '24px';
        element.style.background = '#FFFFFF';
      }
      
      const canvas = await html2canvas(element, {
        backgroundColor: '#FFFFFF', 
        scale: 2, 
        logging: false,
        useCORS: true
      });

      element.setAttribute('style', originalStyle);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const filename = round === 'all' 
        ? `${currentDivision.name.replace(/\s+/g, '_')}_Fixtures.png`
        : `${currentDivision.name.replace(/\s+/g, '_')}_Round_${round}_Fixtures.png`;
      link.download = filename;
      link.href = dataUrl;
      link.click();

      toast.update(toastId, {
        render: 'Image downloaded successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
        theme: 'dark'
      });
    } catch (error) {
      console.error(error);
      toast.update(toastId, {
        render: 'Failed to generate image.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
        theme: 'dark'
      });
    }
  };

  const downloadAsPDF = async (round) => {
    const toastId = toast.loading(
      `Generating visual PDF for ${round === 'all' ? 'All Rounds' : `Round ${round}`}...`, 
      { theme: 'dark' }
    );

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const logoImg = await loadLogo();

      let currentY = 15; 

      if (logoImg) {
        const originalWidth = logoImg.naturalWidth || logoImg.width || 100;
        const originalHeight = logoImg.naturalHeight || logoImg.height || 100;
        const aspect = originalWidth / originalHeight;
        
        const logoWidth = 30; 
        const logoHeight = logoWidth / aspect;
        const logoX = (210 - logoWidth) / 2; 

        doc.addImage(logoImg, 'PNG', logoX, currentY, logoWidth, logoHeight);
        currentY += logoHeight + 8; 
      } else {
        currentY += 10;
      }

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(17, 17, 17); 
      doc.text('SS4 CHESS LEAGUE', 105, currentY, { align: 'center' });
      currentY += 6;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139); 
      const subtitleText = round === 'all'
        ? `${currentDivision.name} Fixtures`
        : `${currentDivision.name} · Round ${round} Fixtures`;
      doc.text(subtitleText, 105, currentY, { align: 'center' });
      currentY += 8;

      doc.setDrawColor(234, 88, 12); 
      doc.setLineWidth(0.8);
      doc.line(15, currentY, 195, currentY);
      currentY += 12; 

      const activeRounds = round === 'all'
        ? currentDivision.rounds.filter(r => !r.hidden)
        : currentDivision.rounds.filter(r => r.round === round && !r.hidden);

      if (activeRounds.length === 0) {
        doc.setFont('Helvetica', 'italic');
        doc.setFontSize(11);
        doc.setTextColor(156, 163, 175);
        doc.text('No active round fixtures found.', 105, currentY, { align: 'center' });
      }

      const leftMargin = 15;
      const tableWidth = 180;
      
      const colWidthWhite = 72;
      const colWidthResult = 36;

      const cellHeight = 8;
      const headerHeight = 10;

      const drawRunningHeader = (pageNumber) => {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(`SS4 Chess League · ${currentDivision.name} Fixtures`, leftMargin, 10);
        doc.text(`Page ${pageNumber}`, 195, 10, { align: 'right' });
        doc.setDrawColor(243, 244, 246);
        doc.setLineWidth(0.2);
        doc.line(leftMargin, 12, 195, 12);
      };

      let pageCount = 1;

      for (const r of activeRounds) {
        const roundHeight = headerHeight + (r.games.length * cellHeight) + 12;

        if (currentY + roundHeight > 280) {
          doc.addPage();
          pageCount++;
          currentY = 20; 
          drawRunningHeader(pageCount);
        }

        doc.setFillColor(248, 250, 252); 
        doc.rect(leftMargin, currentY, tableWidth, headerHeight, 'F');
        
        doc.setDrawColor(241, 245, 249); 
        doc.setLineWidth(0.3);
        doc.line(leftMargin, currentY, 195, currentY);
        doc.line(leftMargin, currentY + headerHeight, 195, currentY + headerHeight);

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(17, 17, 17); 
        doc.text(`Round ${r.round}`, leftMargin + 4, currentY + 6.5);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(234, 88, 12); 
        doc.text(r.date, 195 - 4, currentY + 6.5, { align: 'right' });

        currentY += headerHeight;

        r.games.forEach(([w, b], idx) => {
          const isBye = w === 'BYE' || b === 'BYE';
          const res = gameResults[gameKey(currentDivision.id, r.round, w, b)];
          const wP = getPlayerDisplay(w);
          const bP = getPlayerDisplay(b);

          if (idx % 2 === 1) {
            doc.setFillColor(249, 250, 251); 
            doc.rect(leftMargin, currentY, tableWidth, cellHeight, 'F');
          }

          doc.setDrawColor(243, 244, 246); 
          doc.setLineWidth(0.1);
          doc.line(leftMargin, currentY + cellHeight, 195, currentY + cellHeight);

          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(9.5);

          // Color player names based on match result
          if (isBye) {
            doc.setTextColor(w === 'BYE' ? 156 : 22, w === 'BYE' ? 163 : 163, w === 'BYE' ? 175 : 74);
          } else if (res === 'white') {
            doc.setTextColor(22, 163, 74); // Green for winner
          } else if (res === 'black') {
            doc.setTextColor(220, 38, 38); // Red for loser
          } else if (res === 'draw') {
            doc.setTextColor(107, 114, 128); // Grey for draw
          } else {
            doc.setTextColor(55, 65, 81);
          }
          const whiteText = wP.username ? `${wP.name} (@${wP.username})` : wP.name;
          doc.text(whiteText, leftMargin + colWidthWhite - 4, currentY + 5, { align: 'right' });

          if (isBye) {
            doc.setTextColor(b === 'BYE' ? 156 : 22, b === 'BYE' ? 163 : 163, b === 'BYE' ? 175 : 74);
          } else if (res === 'black') {
            doc.setTextColor(22, 163, 74); // Green for winner
          } else if (res === 'white') {
            doc.setTextColor(220, 38, 38); // Red for loser
          } else if (res === 'draw') {
            doc.setTextColor(107, 114, 128); // Grey for draw
          } else {
            doc.setTextColor(55, 65, 81);
          }
          const blackText = bP.username ? `${bP.name} (@${bP.username})` : bP.name;
          doc.text(blackText, leftMargin + colWidthWhite + colWidthResult + 4, currentY + 5, { align: 'left' });

          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(9);
          
          let resultText = 'vs';
          doc.setTextColor(156, 163, 175); 

          if (isBye) {
            resultText = 'BYE Win';
            doc.setTextColor(22, 163, 74); // Green for winner
          } else if (res === 'white' || res === 'black') {
            resultText = res === 'white' ? '1 - 0' : '0 - 1';
            doc.setTextColor(22, 163, 74); // Green for winner
          } else if (res === 'draw') {
            resultText = '½ - ½';
            doc.setTextColor(107, 114, 128); // Grey for draw
          }

          doc.text(resultText, leftMargin + colWidthWhite + (colWidthResult / 2), currentY + 5, { align: 'center' });

          currentY += cellHeight;
        });

        currentY += 10; 
      }

      const filename = round === 'all'
        ? `${currentDivision.name.replace(/\s+/g, '_')}_Fixtures.pdf`
        : `${currentDivision.name.replace(/\s+/g, '_')}_Round_${round}_Fixtures.pdf`;
      doc.save(filename);

      toast.update(toastId, {
        render: 'PDF downloaded successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
        theme: 'dark'
      });
    } catch (error) {
      console.error(error);
      toast.update(toastId, {
        render: 'Failed to generate PDF.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
        theme: 'dark'
      });
    }
  };

  const triggerExportFlow = (type) => {
    setExportType(type);
    setShowModal(true);
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Premium Download & Round Selection Header bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Selected Round</span>
          <div className="flex flex-wrap gap-2">
            {activeRoundsList.map(r => {
              const allDone = r.games.every(([w, b]) => gameResults[gameKey(currentDivision.id, r.round, w, b)]);
              const isActive = activeRoundData.round === r.round;
              return (
                <button
                  key={r.round}
                  onClick={() => setCurrentRound(r.round)}
                  className={`px-4 py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-brand-primary border-brand-primary text-white shadow-sm' 
                      : allDone 
                        ? 'bg-green-50/50 border-green-200 text-green-700 hover:bg-green-50' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  R{r.round}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:self-center">
          <div className="flex items-center gap-3">
            <button 
              className="flex items-center gap-2 bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-primary text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors select-none"
              onClick={() => triggerExportFlow('image')}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-currentColor">
                <path d="M5 19h14V5H5v14zm0-16h14c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2zm6.5 11.5l-2-2.5-3 4h13l-4-5-4 3.5z"/>
              </svg>
              Export Image
            </button>
            <button 
              className="flex items-center gap-2 bg-brand-accent/5 hover:bg-brand-accent/10 text-brand-accent text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors select-none"
              onClick={() => triggerExportFlow('pdf')}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-currentColor">
                <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
              </svg>
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {activeRoundData && (
        <div className="text-center py-2 bg-brand-bg-cream/40 rounded-2xl border border-dashed border-gray-200/50 animate-in fade-in duration-300">
          <span className="text-xs font-black text-brand-primary uppercase tracking-widest">{activeRoundData.date}</span>
        </div>
      )}

      {/* Fixtures List (Single Tabbed Round) */}
      <div id="fixtures-list" className="space-y-8 bg-transparent max-w-2xl mx-auto">
        {activeRoundData && (
          <div id={`fixture-round-${activeRoundData.round}`} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-m3-outline-variant animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-xl font-bold text-brand-text-dark font-space tracking-tight">Round {activeRoundData.round} Fixtures</h2>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest border border-m3-outline-variant px-3.5 py-1.5 rounded-full">{activeRoundData.date}</span>
            </div>
            
            <div className="flex flex-col gap-4">
              {activeRoundData.games.map(([w, b]) => (
                <MatchFixture 
                  key={`${activeRoundData.round}_${w}_${b}`}
                  w={w}
                  b={b}
                  date={activeRoundData.date}
                  round={activeRoundData.round}
                  division={currentDivision}
                  onPlayerSelect={onPlayerSelect}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Off-screen container for exporting all/non-active rounds */}
      <div 
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          top: '-9999px', 
          width: '800px', 
          background: '#FFFFFF',
          opacity: 0,
          pointerEvents: 'none'
        }}
      >
        <div id="export-fixtures-list" className="space-y-8 bg-white p-6">
          {activeRoundsList.map((r) => (
            <div key={r.round} id={`export-fixture-round-${r.round}`} className="bg-white border border-gray-100 rounded-3xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-50 mb-4">
                <span className="text-lg font-black font-space text-[#111111]">Round {r.round}</span>
                <span className="text-xs font-black text-brand-primary uppercase tracking-widest bg-brand-primary/5 px-3 py-1.5 rounded-full">{r.date}</span>
              </div>
              
              <div className="divide-y divide-gray-50">
                {r.games.map(([w, b]) => {
                  const isBye = w === 'BYE' || b === 'BYE';
                  const res = gameResults[gameKey(currentDivision.id, r.round, w, b)];
                  const wP = getPlayerDisplay(w);
                  const bP = getPlayerDisplay(b);
                  
                  return (
                    <div 
                      key={`${r.round}_${w}_${b}`} 
                      className={`flex flex-row items-center justify-between gap-4 py-4 ${
                        res || isBye ? 'opacity-80' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="w-6 h-6 rounded-md bg-gray-100 text-[#111111] border border-gray-200 text-[10px] font-black flex items-center justify-center flex-shrink-0 select-none">W</span>
                        <div className="truncate">
                          <span className={`text-sm block truncate ${
                            isBye ? (
                              w === 'BYE' ? 'text-gray-300 font-medium' : 'text-green-600 font-extrabold'
                            ) : res ? (
                              res === 'white' 
                                ? 'text-green-600 font-extrabold' 
                                : res === 'draw' 
                                  ? 'text-gray-500 font-semibold' 
                                  : 'text-red-500 font-semibold'
                            ) : 'text-[#111111] font-bold'
                          }`}>{wP.name}</span>
                          {wP.username && <span className="text-[10px] font-semibold text-gray-400">@{wP.username}</span>}
                        </div>
                      </div>

                      <span className="text-xs font-black text-gray-300 uppercase tracking-widest px-2 select-none">vs</span>

                      <div className="flex items-center justify-end gap-3 flex-1 min-w-0 text-right">
                        <div className="truncate">
                          <span className={`text-sm block truncate ${
                            isBye ? (
                              b === 'BYE' ? 'text-gray-300 font-medium' : 'text-green-600 font-extrabold'
                            ) : res ? (
                              res === 'black' 
                                ? 'text-green-600 font-extrabold' 
                                : res === 'draw' 
                                  ? 'text-gray-500 font-semibold' 
                                  : 'text-red-500 font-semibold'
                            ) : 'text-[#111111] font-bold'
                          }`}>{bP.name}</span>
                          {bP.username && <span className="text-[10px] font-semibold text-gray-400">@{bP.username}</span>}
                        </div>
                        <span className="w-6 h-6 rounded-md bg-[#111111] text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 select-none">B</span>
                      </div>

                      <div className="flex items-center justify-end min-w-[120px]">
                        {isBye ? (
                          <span className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full uppercase tracking-wider select-none">
                            BYE Win
                          </span>
                        ) : res ? (
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider select-none border ${
                            res === 'white' || res === 'black'
                              ? 'bg-green-50 text-green-700 border-green-200/60' 
                              : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}>
                            {res === 'white' && `Winner: ${wP.name.split(' ')[0]}`}
                            {res === 'black' && `Winner: ${bP.name.split(' ')[0]}`}
                            {res === 'draw' && "Match Draw"}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-gray-50 text-gray-400 border border-gray-100 px-3 py-1 rounded-full uppercase tracking-wider select-none">
                            Scheduled
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Styled Export Modal overlay */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/40 backdrop-blur-sm transition-all duration-300 animate-in fade-in"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-8 max-w-sm w-full relative shadow-2xl border border-gray-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="absolute top-6 right-6 text-gray-400 hover:text-[#111111] text-2xl font-black w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>

            <h3 className="font-space text-lg font-black text-[#111111] mb-2">Export Round Fixtures</h3>
            <p className="text-xs font-semibold text-gray-400 mb-6">
              Select which round fixtures to download as {exportType === 'image' ? 'a PNG Image' : 'a visual PDF'}:
            </p>
            
            <div className="grid grid-cols-3 gap-2 w-full mb-4">
              {activeRoundsList.map(r => (
                <button
                  key={r.round}
                  className="bg-brand-bg-cream hover:bg-brand-bg-cream/70 text-[#111111] font-black text-xs py-2.5 rounded-xl border border-gray-200/50 hover:border-gray-300 transition-all cursor-pointer"
                  onClick={() => {
                    setShowModal(false);
                    if (exportType === 'image') {
                      downloadAsImage(r.round);
                    } else {
                      downloadAsPDF(r.round);
                    }
                  }}
                >
                  R{r.round}
                </button>
              ))}
            </div>

            <button
              className="w-full bg-brand-primary hover:bg-brand-primary/95 text-white font-black text-xs py-3 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer mb-2"
              onClick={() => {
                setShowModal(false);
                if (exportType === 'image') {
                  downloadAsImage('all');
                } else {
                  downloadAsPDF('all');
                }
              }}
            >
              Export All Rounds
            </button>

            <button 
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer" 
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

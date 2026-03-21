import React, { useState } from 'react';
import { Package, Hash, Ruler, Hammer, ChevronLeft } from 'lucide-react';

const ChainLinkCalculator = ({ onBack }) => {
  const [footage, setFootage] = useState(100);
  const [height, setHeight] = useState(6);
  const [corners, setCorners] = useState(2);
  const [ends, _setEnds] = useState(2);
  const [singleGates, setSingleGates] = useState(0);
  const [doubleGates, setDoubleGates] = useState(0);
  const [spacing, setSpacing] = useState(10);

  // Constants
  const ROLL_LENGTH = 50;
  const RAIL_LENGTH = 21;

  // Calculations
  const calcResults = () => {
    const totalFootage = parseFloat(footage) || 0;
    const fabricRolls = Math.ceil(totalFootage / ROLL_LENGTH);

    // Posts
    const terminalPosts = parseInt(corners) + parseInt(ends) + (parseInt(singleGates) * 2) + (parseInt(doubleGates) * 2);
    const linePosts = Math.max(0, Math.ceil(totalFootage / spacing) - terminalPosts + 1);

    // Rails
    const topRails = Math.ceil(totalFootage / RAIL_LENGTH);

    // Fittings (Basic Estimation)
    const tensionBands = terminalPosts * 5; // 5 per terminal post for 6ft
    const braceBands = terminalPosts * 2;
    const carriageBolts = tensionBands + braceBands;
    const postCaps = terminalPosts;
    const loopCaps = linePosts;
    const railEnds = braceBands;
    const tieWires = Math.ceil(totalFootage / 2); // 1 per 2ft

    return {
      fabricRolls,
      linePosts,
      terminalPosts,
      topRails,
      fittings: {
        tensionBands,
        braceBands,
        carriageBolts,
        postCaps,
        loopCaps,
        railEnds,
        tieWires
      }
    };
  };

  const results = calcResults();

  return (
    <div className="calc-container" style={{ animation: 'slideUp 0.3s ease-out' }}>
      <header className="calc-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
        <button onClick={onBack} className="action-btn outline" style={{ height: '40px', width: '40px', padding: 0 }}>
          <ChevronLeft size={20} />
        </button>
        <h2 className="oswald-title" style={{ fontSize: '1.4rem' }}>CHAIN LINK MATERIAL CALCULATOR</h2>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* INPUTS */}
        <div className="widget" style={{ padding: '25px' }}>
          <h3 className="widget-title oswald-title" style={{ fontSize: '1rem' }}>PROJECT SPECS</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', marginBottom: '5px' }}>TOTAL LINEAR FOOTAGE</label>
              <div className="input-shell" style={{ border: '1px solid var(--border-color)', background: '#f9f9f9' }}>
                <input
                  type="number"
                  value={footage}
                  onChange={(e) => setFootage(e.target.value)}
                  style={{ width: '100%', border: 'none', background: 'transparent', padding: '10px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="input-group">
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', marginBottom: '5px' }}>HEIGHT (FT)</label>
                <select
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                >
                  <option value={4}>4'</option>
                  <option value={5}>5'</option>
                  <option value={6}>6'</option>
                </select>
              </div>
              <div className="input-group">
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', marginBottom: '5px' }}>POST SPACING (FT)</label>
                <input
                  type="number"
                  value={spacing}
                  onChange={(e) => setSpacing(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="input-group">
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', marginBottom: '5px' }}>ENDS / CORNERS</label>
                <input
                  type="number"
                  value={corners}
                  onChange={(e) => setCorners(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                />
              </div>
              <div className="input-group">
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', marginBottom: '5px' }}>GATES (SING/DBL)</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input type="number" value={singleGates} onChange={(e) => setSingleGates(e.target.value)} style={{ width: '50%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                  <input type="number" value={doubleGates} onChange={(e) => setDoubleGates(e.target.value)} style={{ width: '50%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RESULTS */}
        <div className="widget green" style={{ padding: '25px', position: 'relative' }}>
          <h3 className="widget-title oswald-title" style={{ fontSize: '1rem', borderBottomColor: 'var(--superior-green)' }}>BOM ESTIMATE</h3>

          <div className="results-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="stat-widget gray" style={{ boxIcons: 'none', border: 'none', padding: '15px', background: 'var(--bg-app)' }}>
              <span className="w-val" style={{ fontSize: '1.5rem' }}>{results.fabricRolls}</span>
              <span className="w-label">50' ROLLS</span>
            </div>
            <div className="stat-widget gray" style={{ boxIcons: 'none', border: 'none', padding: '15px', background: 'var(--bg-app)' }}>
              <span className="w-val" style={{ fontSize: '1.5rem' }}>{results.linePosts}</span>
              <span className="w-label">LINE POSTS</span>
            </div>
            <div className="stat-widget gray" style={{ boxIcons: 'none', border: 'none', padding: '15px', background: 'var(--bg-app)' }}>
              <span className="w-val" style={{ fontSize: '1.5rem' }}>{results.terminalPosts}</span>
              <span className="w-label">TERMINAL POSTS</span>
            </div>
            <div className="stat-widget gray" style={{ boxIcons: 'none', border: 'none', padding: '15px', background: 'var(--bg-app)' }}>
              <span className="w-val" style={{ fontSize: '1.5rem' }}>{results.topRails}</span>
              <span className="w-label">21' TOP RAILS</span>
            </div>
          </div>

          <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
            <h4 className="oswald-title" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>FITTINGS LIST</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', fontSize: '0.8rem' }}>
              <div>• {results.fittings.tensionBands} Tension Bands</div>
              <div>• {results.fittings.braceBands} Brace Bands</div>
              <div>• {results.fittings.postCaps} Post Caps</div>
              <div>• {results.fittings.railEnds} Rail Ends</div>
              <div>• {results.fittings.loopCaps} Loop Caps</div>
              <div>• {results.fittings.tieWires} Tie Wires (6")</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChainLinkCalculator;

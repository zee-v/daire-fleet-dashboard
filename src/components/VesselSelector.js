import React, { useState, useRef, useEffect } from 'react';
import './VesselSelector.css';

/**
 * VesselSelector - A popup modal for selecting vessels with search and checkbox support
 * Used in the graph header area to switch between vessels for the selected component
 * 
 * @param {Object} props
 * @param {string[]} props.vessels - Array of vessel identifiers (e.g., ["Tail 1", "Tail 2"])
 * @param {string[]|string|null} props.selectedVessel - Currently selected vessel(s)
 * @param {Function} props.onVesselSelect - Callback when vessel is selected
 */
export default function VesselSelector({ vessels, selectedVessel, onVesselSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVessels, setSelectedVessels] = useState([]);
  const searchInputRef = useRef(null);
  const modalRef = useRef(null);

  // Initialize selected vessels when modal opens
  useEffect(() => {
    if (isOpen) {
      // Handle both single vessel (string) and multiple vessels (array)
      if (Array.isArray(selectedVessel)) {
        setSelectedVessels(selectedVessel);
      } else if (selectedVessel) {
        setSelectedVessels([selectedVessel]);
      } else {
        setSelectedVessels([]);
      }
    }
  }, [isOpen, selectedVessel]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const handleCheckboxChange = (vessel) => {
    setSelectedVessels(prev => {
      if (prev.includes(vessel)) {
        return prev.filter(v => v !== vessel);
      } else {
        return [...prev, vessel]; // Multi-selection - add to array
      }
    });
  };

  const handleApply = () => {
    if (selectedVessels.length > 0) {
      onVesselSelect(selectedVessels); // Apply all selected vessels
    }
    handleClose();
  };

  const handleSelectAll = () => {
    const filtered = getFilteredVessels();
    if (selectedVessels.length === filtered.length) {
      setSelectedVessels([]);
    } else {
      setSelectedVessels([...filtered]);
    }
  };

  const getFilteredVessels = () => {
    if (!searchTerm.trim()) return vessels;
    const search = searchTerm.toLowerCase();
    return vessels.filter(vessel => 
      vessel.toLowerCase().includes(search)
    );
  };

  const filteredVessels = getFilteredVessels();
  
  // Display text for button
  let displayText;
  if (Array.isArray(selectedVessel)) {
    displayText = selectedVessel.length === 0 
      ? 'Select Vessels' 
      : selectedVessel.length === 1 
        ? selectedVessel[0]
        : `${selectedVessel.length} vessels selected`;
  } else {
    displayText = selectedVessel || (vessels.length > 0 ? vessels[0] : 'Select Vessels');
  }
  
  const allSelected = filteredVessels.length > 0 && selectedVessels.length === filteredVessels.length;

  return (
    <>
      <div className="vessel-selector">
        <button
          className="vessel-selector-btn"
          onClick={() => setIsOpen(true)}
          aria-haspopup="dialog"
        >
          <span className="vessel-selector-label">Vessel:</span>
          <span className="vessel-selector-value">{displayText}</span>
          <span className="vessel-selector-arrow">▾</span>
        </button>
      </div>

      {isOpen && (
        <div className="vessel-modal-overlay" onClick={handleOverlayClick}>
          <div className="vessel-modal" ref={modalRef}>
            {/* Modal Header */}
            <div className="vessel-modal-header">
              <h3 className="vessel-modal-title">Select Vessels</h3>
              <button 
                className="vessel-modal-close"
                onClick={handleClose}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Search Bar */}
            <div className="vessel-modal-search">
              <input
                ref={searchInputRef}
                type="text"
                className="vessel-search-input"
                placeholder="Search vessels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="vessel-search-icon">🔍</span>
            </div>

            {/* Select All Option */}
            {filteredVessels.length > 0 && (
              <div className="vessel-select-all">
                <label className="vessel-checkbox-label">
                  <input
                    type="checkbox"
                    className="vessel-checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                  />
                  <span className="vessel-checkbox-custom"></span>
                  <span className="vessel-checkbox-text">
                    Select All ({filteredVessels.length})
                  </span>
                </label>
              </div>
            )}

            {/* Vessel List */}
            <div className="vessel-modal-list">
              {filteredVessels.length === 0 ? (
                <div className="vessel-modal-empty">
                  {searchTerm ? `No vessels found matching "${searchTerm}"` : 'No vessels available'}
                </div>
              ) : (
                filteredVessels.map((vessel) => (
                  <label key={vessel} className="vessel-checkbox-label">
                    <input
                      type="checkbox"
                      className="vessel-checkbox"
                      checked={selectedVessels.includes(vessel)}
                      onChange={() => handleCheckboxChange(vessel)}
                    />
                    <span className="vessel-checkbox-custom"></span>
                    <span className="vessel-checkbox-text">{vessel}</span>
                  </label>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="vessel-modal-footer">
              <div className="vessel-modal-count">
                {selectedVessels.length} selected
              </div>
              <div className="vessel-modal-actions">
                <button 
                  className="vessel-modal-btn vessel-modal-btn-cancel"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button 
                  className="vessel-modal-btn vessel-modal-btn-apply"
                  onClick={handleApply}
                  disabled={selectedVessels.length === 0}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

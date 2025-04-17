// Inventory Management JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize inventory features
    initializeInventoryUpload();
    loadInventoryData();
    setupFilterButtons();
    setupSimulation();
});

// Upload functionality
function initializeInventoryUpload() {
    // Barcode upload area click handler
    const barcodeUploadArea = document.getElementById('barcodeUploadArea');
    const barcodeFileInput = document.getElementById('barcodeFileInput');
    const barcodePreview = document.getElementById('barcodePreview');
    const previewImage = document.getElementById('previewImage');
    const removeBarcodeBtn = document.getElementById('removeBarcodeBtn');
    
    if (barcodeUploadArea && barcodeFileInput) {
        barcodeUploadArea.addEventListener('click', function() {
            barcodeFileInput.click();
        });
        
        barcodeFileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                    barcodePreview.style.display = 'flex';
                    barcodeUploadArea.style.display = 'none';
                };
                
                reader.readAsDataURL(file);
            }
        });
        
        // Remove barcode image
        if (removeBarcodeBtn) {
            removeBarcodeBtn.addEventListener('click', function() {
                barcodeFileInput.value = '';
                barcodePreview.style.display = 'none';
                barcodeUploadArea.style.display = 'block';
            });
        }
    }
    
    // Excel file upload
    const excelUploadArea = document.getElementById('excelUploadArea');
    const excelFileInput = document.getElementById('excelFileInput');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const removeFileBtn = document.getElementById('removeFileBtn');
    
    if (excelUploadArea && excelFileInput) {
        excelUploadArea.addEventListener('click', function() {
            excelFileInput.click();
        });
        
        excelFileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                fileName.textContent = file.name;
                fileInfo.style.display = 'flex';
                excelUploadArea.style.display = 'none';
            }
        });
        
        // Remove excel file
        if (removeFileBtn) {
            removeFileBtn.addEventListener('click', function() {
                excelFileInput.value = '';
                fileInfo.style.display = 'none';
                excelUploadArea.style.display = 'block';
            });
        }
    }
    
    // Process button
    const processBtn = document.getElementById('processInventoryBtn');
    if (processBtn) {
        processBtn.addEventListener('click', function() {
            if (barcodeFileInput.files.length > 0 || excelFileInput.files.length > 0) {
                showProcessingNotification();
                
                // Simulate processing delay
                setTimeout(() => {
                    showSuccessNotification();
                    loadInventoryData(); // Reload data after processing
                }, 1500);
            } else {
                showErrorNotification('Please upload a barcode image or Excel file first');
            }
        });
    }
}

// Load inventory data from API
function loadInventoryData() {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;
    
    // Show loading state
    tableBody.innerHTML = '<tr><td colspan="12" class="text-center py-4"><i class="fas fa-spinner fa-spin me-2"></i> Loading inventory data...</td></tr>';
    
    // Fetch inventory data
    fetch('/api/inventory')
        .then(response => response.json())
        .then(data => {
            renderInventoryTable(data.items);
            updateInventoryStats(data.items);
        })
        .catch(error => {
            console.error('Error fetching inventory data:', error);
            
            // Fallback with sample data for demonstration
            const sampleInventory = [
                {
                    "id": "1",
                    "name": "Lotte Chocopie",
                    "sku": "LC001",
                    "category": "Confectionery",
                    "quantity": 24,
                    "price": 40.0,
                    "cost_price": 32.0,
                    "supplier_id": "1",
                    "reorder_level": 10,
                    "last_updated": "2025-04-04T19:08:15.691938"
                },
                {
                    "id": "2",
                    "name": "Tata Salt",
                    "sku": "TS001",
                    "category": "Essentials",
                    "quantity": 50,
                    "price": 20.0,
                    "cost_price": 16.0,
                    "supplier_id": "2",
                    "reorder_level": 15,
                    "last_updated": "2025-04-04T19:08:15.691948"
                },
                {
                    "id": "3",
                    "name": "Basmati Rice (1kg)",
                    "sku": "BR001",
                    "category": "Staples",
                    "quantity": 30,
                    "price": 80.0,
                    "cost_price": 65.0,
                    "supplier_id": "3",
                    "reorder_level": 10,
                    "last_updated": "2025-04-04T19:08:15.691951"
                },
                {
                    "id": "4",
                    "name": "Toor Dal (500g)",
                    "sku": "TD001",
                    "category": "Staples",
                    "quantity": 35,
                    "price": 60.0,
                    "cost_price": 48.0,
                    "supplier_id": "3",
                    "reorder_level": 12,
                    "last_updated": "2025-04-04T19:08:15.691954"
                },
                {
                    "id": "5",
                    "name": "Amul Butter (100g)",
                    "sku": "AB001",
                    "category": "Dairy",
                    "quantity": 20,
                    "price": 50.0,
                    "cost_price": 43.0,
                    "supplier_id": "4",
                    "reorder_level": 8,
                    "last_updated": "2025-04-04T19:08:15.691956"
                }
            ];
            
            renderInventoryTable(sampleInventory);
            updateInventoryStats(sampleInventory);
        });
}

// Render inventory table
function renderInventoryTable(items) {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (items.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="12" class="text-center py-4">No inventory items found</td></tr>';
        return;
    }
    
    items.forEach(item => {
        // Calculate profit margin
        const margin = ((item.price - item.cost_price) / item.price * 100).toFixed(1);
        
        // Determine stock status
        let statusClass = 'status-ok';
        let statusText = 'In Stock';
        
        if (item.quantity <= item.reorder_level * 0.5) {
            statusClass = 'status-low';
            statusText = 'Low Stock';
        } else if (item.quantity <= item.reorder_level) {
            statusClass = 'status-warning';
            statusText = 'Reorder Soon';
        }
        
        // Format date
        const updatedDate = new Date(item.last_updated);
        const formattedDate = updatedDate.toLocaleDateString() + ' ' + 
                             updatedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const row = document.createElement('tr');
        row.dataset.id = item.id;
        row.dataset.status = statusClass.split('-')[1]; // For filtering
        
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.sku}</td>
            <td>${item.category}</td>
            <td>${item.quantity}</td>
            <td>
                <div class="status-cell">
                    <span class="status-indicator ${statusClass}"></span>
                    ${statusText}
                </div>
            </td>
            <td>₹${item.price.toFixed(2)}</td>
            <td>₹${item.cost_price.toFixed(2)}</td>
            <td>${margin}%</td>
            <td>${item.reorder_level}</td>
            <td>${formattedDate}</td>
            <td class="action-cell">
                <button class="btn btn-sm btn-outline-primary btn-action" onclick="editItem('${item.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-success btn-action" onclick="orderItem('${item.id}')">
                    <i class="fas fa-shopping-cart"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Update inventory statistics
function updateInventoryStats(items) {
    const totalItemsEl = document.getElementById('totalItems');
    const lowStockCountEl = document.getElementById('lowStockCount');
    const inventoryValueEl = document.getElementById('inventoryValue');
    const turnoverRateEl = document.getElementById('turnoverRate');
    
    if (totalItemsEl && lowStockCountEl && inventoryValueEl) {
        // Update total items count
        totalItemsEl.textContent = items.length;
        
        // Count low stock items
        const lowStockItems = items.filter(item => item.quantity <= item.reorder_level);
        lowStockCountEl.textContent = lowStockItems.length;
        
        // Calculate total inventory value
        const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.cost_price), 0);
        inventoryValueEl.textContent = '₹' + totalValue.toLocaleString('en-IN');
        
        // Set turnover rate if element exists
        if (turnoverRateEl) {
            // Simulated turnover rate based on inventory level
            const averageStock = items.reduce((sum, item) => sum + item.quantity, 0) / items.length;
            const turnoverRate = (4.5 + (Math.random() * 1)).toFixed(1) + 'x';
            turnoverRateEl.textContent = turnoverRate;
        }
    }
}

// Setup filter buttons
function setupFilterButtons() {
    const lowStockBtn = document.getElementById('lowStockBtn');
    const inStockBtn = document.getElementById('inStockBtn');
    const allItemsBtn = document.getElementById('allItemsBtn');
    const searchInput = document.getElementById('inventorySearch');
    
    if (lowStockBtn && inStockBtn && allItemsBtn && searchInput) {
        // Filter for low stock items
        lowStockBtn.addEventListener('click', function() {
            filterInventoryItems('low');
            setActiveFilterButton(this);
        });
        
        // Filter for in-stock items
        inStockBtn.addEventListener('click', function() {
            filterInventoryItems('ok');
            setActiveFilterButton(this);
        });
        
        // Show all items
        allItemsBtn.addEventListener('click', function() {
            filterInventoryItems('all');
            setActiveFilterButton(this);
        });
        
        // Search functionality
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            searchInventoryItems(searchTerm);
        });
    }
}

// Set active filter button
function setActiveFilterButton(button) {
    const filterButtons = document.querySelectorAll('.filter-buttons .btn');
    filterButtons.forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline-primary', 'btn-outline-danger', 'btn-outline-success');
    });
    
    // Add active class to the clicked button
    button.classList.remove('btn-outline-primary', 'btn-outline-danger', 'btn-outline-success');
    button.classList.add('btn-primary');
}

// Filter inventory items by status
function filterInventoryItems(status) {
    const rows = document.querySelectorAll('#inventoryTableBody tr');
    
    rows.forEach(row => {
        if (status === 'all' || row.dataset.status === status) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Search inventory items
function searchInventoryItems(term) {
    const rows = document.querySelectorAll('#inventoryTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(term)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Setup simulation tools
function setupSimulation() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const simulationSelect = document.getElementById('simulationSelect');
    
    if (analyzeBtn && simulationSelect) {
        analyzeBtn.addEventListener('click', function() {
            const simulationType = simulationSelect.value;
            showProcessingNotification('Running simulation...');
            
            // Simulate processing delay
            setTimeout(() => {
                runSimulation(simulationType);
                showSuccessNotification('Simulation complete');
            }, 1500);
        });
    }
}

// Run inventory simulation
function runSimulation(type) {
    // Get current inventory data
    const rows = document.querySelectorAll('#inventoryTableBody tr');
    const items = [];
    
    rows.forEach(row => {
        if (row.cells && row.cells.length >= 5) {
            const id = row.cells[0].textContent;
            const name = row.cells[1].textContent;
            const sku = row.cells[2].textContent;
            const category = row.cells[3].textContent;
            const quantity = parseInt(row.cells[4].textContent);
            const price = parseFloat(row.cells[6].textContent.replace('₹', ''));
            const cost = parseFloat(row.cells[7].textContent.replace('₹', ''));
            const reorderLevel = parseInt(row.cells[9].textContent);
            
            items.push({ 
                id, 
                name, 
                sku,
                category,
                quantity, 
                price,
                cost,
                reorderLevel
            });
        }
    });
    
    // Apply simulation based on type
    switch (type) {
        case 'seasonal':
            applySeasionalSimulation(items);
            break;
        case 'stockout':
            applyStockoutSimulation(items);
            break;
        case 'pricing':
            applyPricingSimulation();
            break;
        case 'reordering':
            applyReorderingAnalysis(items);
            break;
        case 'expiry':
            applyExpiryTracking(items);
            break;
        case 'sales':
            applySalesAnalytics(items);
            break;
        case 'restructure':
            applyInventoryRestructuring(items);
            break;
    }
}

// Apply seasonal demand simulation
function applySeasionalSimulation(items) {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;
    
    // Create a simulation info row
    const infoRow = document.createElement('tr');
    infoRow.classList.add('simulation-info-row');
    infoRow.innerHTML = `
        <td colspan="12" class="p-3 bg-info text-white">
            <i class="fas fa-chart-line me-2"></i>
            <strong>Seasonal Demand Simulation:</strong> Showing projected inventory based on historical seasonal patterns.
            <button class="btn btn-sm btn-light ms-3" onclick="loadInventoryData()">Reset</button>
        </td>
    `;
    
    // Insert at the top of the table
    tableBody.insertBefore(infoRow, tableBody.firstChild);
    
    // Modify quantity columns with seasonal projections
    items.forEach(item => {
        const row = document.querySelector(`tr[data-id="${item.id}"]`);
        if (row && row.cells && row.cells.length >= 5) {
            const quantityCell = row.cells[4];
            const currentQuantity = parseInt(quantityCell.textContent);
            
            // Apply seasonal factor (example: holiday season increases demand by 40-80%)
            const seasonalFactor = 1 + (Math.random() * 0.4 + 0.4);
            const projectedQuantity = Math.max(0, Math.round(currentQuantity - (currentQuantity / seasonalFactor)));
            
            // Show projected quantity with comparison
            quantityCell.innerHTML = `
                <span style="text-decoration: line-through; color: #777;">${currentQuantity}</span>
                → <strong>${projectedQuantity}</strong>
                <small class="text-danger d-block">-${Math.round((currentQuantity - projectedQuantity) / currentQuantity * 100)}%</small>
            `;
            
            // Update status cell based on projected quantity
            const statusCell = row.cells[5];
            if (projectedQuantity <= item.reorderLevel * 0.5) {
                statusCell.innerHTML = `
                    <div class="status-cell">
                        <span class="status-indicator status-low"></span>
                        Critical (Projected)
                    </div>
                `;
            } else if (projectedQuantity <= item.reorderLevel) {
                statusCell.innerHTML = `
                    <div class="status-cell">
                        <span class="status-indicator status-warning"></span>
                        Low Stock (Projected)
                    </div>
                `;
            }
        }
    });
}

// Apply stockout risk simulation
function applyStockoutSimulation(items) {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;
    
    // Create a simulation info row
    const infoRow = document.createElement('tr');
    infoRow.classList.add('simulation-info-row');
    infoRow.innerHTML = `
        <td colspan="12" class="p-3 bg-warning text-white">
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>Stockout Risk Analysis:</strong> Showing items with high risk of stockout in the next 30 days.
            <button class="btn btn-sm btn-light ms-3" onclick="loadInventoryData()">Reset</button>
        </td>
    `;
    
    // Insert at the top of the table
    tableBody.insertBefore(infoRow, tableBody.firstChild);
    
    // Sort rows by stockout risk (low quantity to reorder level ratio)
    const rows = Array.from(tableBody.querySelectorAll('tr:not(.simulation-info-row)'));
    
    rows.sort((a, b) => {
        const aData = items.find(item => item.id === a.dataset.id);
        const bData = items.find(item => item.id === b.dataset.id);
        
        if (!aData || !bData) return 0;
        
        // Calculate risk scores (lower quantity/reorderLevel is higher risk)
        const aRisk = aData.quantity / aData.reorderLevel;
        const bRisk = bData.quantity / bData.reorderLevel;
        
        return aRisk - bRisk;
    });
    
    // Clear and re-append rows in new order
    rows.forEach(row => tableBody.appendChild(row));
    
    // Highlight stockout risks
    items.forEach(item => {
        const row = document.querySelector(`tr[data-id="${item.id}"]`);
        if (!row) return;
        
        // Calculate days until stockout at current consumption rate
        const dailyUsage = Math.max(1, Math.ceil(item.reorderLevel / 15)); // Approximate daily usage
        const daysToStockout = Math.round(item.quantity / dailyUsage);
        
        // Add stockout prediction
        const daysCell = document.createElement('td');
        daysCell.colSpan = "2";
        daysCell.innerHTML = `
            <div class="stockout-prediction">
                <strong>${daysToStockout} days</strong> until stockout
                <div class="progress mt-1" style="height: 6px;">
                    <div class="progress-bar ${daysToStockout < 10 ? 'bg-danger' : daysToStockout < 20 ? 'bg-warning' : 'bg-success'}" 
                         style="width: ${Math.min(100, daysToStockout * 3)}%"></div>
                </div>
            </div>
        `;
        
        // Replace last updated and reorder level cells with days to stockout
        if (row.cells && row.cells.length >= 11) {
            row.deleteCell(10); // Last updated
            row.deleteCell(9); // Reorder level
            row.insertBefore(daysCell, row.cells[9]);
        }
    });
}

// Apply pricing optimization simulation
function applyPricingSimulation() {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;
    
    // Create a simulation info row
    const infoRow = document.createElement('tr');
    infoRow.classList.add('simulation-info-row');
    infoRow.innerHTML = `
        <td colspan="12" class="p-3 bg-success text-white">
            <i class="fas fa-tags me-2"></i>
            <strong>Pricing Optimization:</strong> Suggested price adjustments to maximize profitability.
            <button class="btn btn-sm btn-light ms-3" onclick="loadInventoryData()">Reset</button>
        </td>
    `;
    
    // Insert at the top of the table
    tableBody.insertBefore(infoRow, tableBody.firstChild);
    
    // Optimize pricing for each product
    const rows = tableBody.querySelectorAll('tr:not(.simulation-info-row)');
    
    rows.forEach(row => {
        if (row.cells && row.cells.length >= 8) {
            const priceCell = row.cells[6];
            const costCell = row.cells[7];
            const marginCell = row.cells[8];
            
            // Current values
            const currentPrice = parseFloat(priceCell.textContent.replace('₹', ''));
            const cost = parseFloat(costCell.textContent.replace('₹', ''));
            const currentMargin = parseFloat(marginCell.textContent.replace('%', ''));
            
            // Calculate optimized price (simulated)
            const optimizationType = Math.floor(Math.random() * 3);
            let newPrice, marginChange, newMargin;
            
            if (optimizationType === 0) {
                // Increase price for premium positioning
                newPrice = currentPrice * (1 + (Math.random() * 0.15 + 0.05)).toFixed(2);
                newMargin = ((newPrice - cost) / newPrice * 100).toFixed(1);
                marginChange = (newMargin - currentMargin).toFixed(1);
                
                priceCell.innerHTML = `
                    <span style="text-decoration: line-through; color: #777;">₹${currentPrice.toFixed(2)}</span>
                    → <strong class="text-success">₹${newPrice.toFixed(2)}</strong>
                    <small class="text-success d-block">+${((newPrice - currentPrice) / currentPrice * 100).toFixed(1)}%</small>
                `;
                
                marginCell.innerHTML = `
                    <span style="text-decoration: line-through; color: #777;">${currentMargin}%</span>
                    → <strong class="text-success">${newMargin}%</strong>
                    <small class="text-success d-block">+${marginChange}%</small>
                `;
            } else if (optimizationType === 1) {
                // Decrease price for volume sales
                newPrice = currentPrice * (1 - (Math.random() * 0.1 + 0.02)).toFixed(2);
                newMargin = ((newPrice - cost) / newPrice * 100).toFixed(1);
                marginChange = (newMargin - currentMargin).toFixed(1);
                
                priceCell.innerHTML = `
                    <span style="text-decoration: line-through; color: #777;">₹${currentPrice.toFixed(2)}</span>
                    → <strong class="text-primary">₹${newPrice.toFixed(2)}</strong>
                    <small class="text-primary d-block">-${((currentPrice - newPrice) / currentPrice * 100).toFixed(1)}%</small>
                `;
                
                marginCell.innerHTML = `
                    <span style="text-decoration: line-through; color: #777;">${currentMargin}%</span>
                    → <strong>${newMargin}%</strong>
                    <small class="text-danger d-block">${marginChange}%</small>
                `;
            } else {
                // Maintain price (already optimal)
                priceCell.innerHTML = `
                    <strong>₹${currentPrice.toFixed(2)}</strong>
                    <small class="text-muted d-block">Optimal</small>
                `;
                
                marginCell.innerHTML = `
                    <strong>${currentMargin}%</strong>
                    <small class="text-muted d-block">Optimal</small>
                `;
            }
        }
    });
}

// Apply reordering analysis simulation
function applyReorderingAnalysis(items) {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;
    
    // Create a simulation info row
    const infoRow = document.createElement('tr');
    infoRow.classList.add('simulation-info-row');
    infoRow.innerHTML = `
        <td colspan="12" class="p-3 bg-primary text-white">
            <i class="fas fa-shopping-cart me-2"></i>
            <strong>Reordering Analysis:</strong> AI-calculated quantities and one-click reordering recommendations.
            <button class="btn btn-sm btn-light ms-3" onclick="loadInventoryData()">Reset</button>
        </td>
    `;
    
    // Insert at the top of the table
    tableBody.insertBefore(infoRow, tableBody.firstChild);
    
    // Update table headers to include reordering columns
    const headerRow = document.querySelector('#inventoryTable thead tr');
    if (headerRow) {
        // Replace last two columns with reordering info
        headerRow.deleteCell(11); // Actions
        headerRow.deleteCell(10); // Last Updated
        
        const reorderQtyHeader = document.createElement('th');
        reorderQtyHeader.textContent = 'Suggested Reorder';
        headerRow.appendChild(reorderQtyHeader);
        
        const reorderActionHeader = document.createElement('th');
        reorderActionHeader.textContent = 'Action';
        headerRow.appendChild(reorderActionHeader);
    }
    
    // Add reordering recommendations
    items.forEach(item => {
        const row = document.querySelector(`tr[data-id="${item.id}"]`);
        if (!row) return;
        
        // Calculate suggested reorder quantity based on consumption rate and lead time
        const optimalOrderQty = Math.max(
            Math.ceil(item.reorderLevel * 1.5),
            Math.ceil((item.reorderLevel - item.quantity) * 1.2)
        );
        
        // Calculate priority level based on current stock vs reorder level
        const stockRatio = item.quantity / item.reorderLevel;
        let priorityClass, priorityText;
        
        if (stockRatio <= 0.5) {
            priorityClass = 'danger';
            priorityText = 'Critical';
        } else if (stockRatio <= 1) {
            priorityClass = 'warning';
            priorityText = 'High';
        } else if (stockRatio <= 1.5) {
            priorityClass = 'info';
            priorityText = 'Medium';
        } else {
            priorityClass = 'success';
            priorityText = 'Low';
        }
        
        // Replace last two cells with reordering info
        if (row.cells && row.cells.length >= 12) {
            row.deleteCell(11); // Actions
            row.deleteCell(10); // Last Updated
            
            // Add suggested reorder quantity cell
            const reorderQtyCell = document.createElement('td');
            reorderQtyCell.innerHTML = `
                <div class="d-flex align-items-center">
                    <input type="number" class="form-control form-control-sm" value="${optimalOrderQty}" min="1" style="width: 70px;">
                    <span class="ms-2 badge bg-${priorityClass}">${priorityText}</span>
                </div>
                <small class="text-muted d-block">Lead time: 3-5 days</small>
            `;
            row.appendChild(reorderQtyCell);
            
            // Add reorder action cell
            const actionCell = document.createElement('td');
            actionCell.innerHTML = `
                <button class="btn btn-sm btn-success" onclick="alert('Order placed for ${item.name}')">
                    <i class="fas fa-cart-plus me-1"></i> Order
                </button>
            `;
            row.appendChild(actionCell);
        }
    });
}

// Apply expiry tracking simulation
function applyExpiryTracking(items) {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;
    
    // Create a simulation info row
    const infoRow = document.createElement('tr');
    infoRow.classList.add('simulation-info-row');
    infoRow.innerHTML = `
        <td colspan="12" class="p-3 bg-danger text-white">
            <i class="fas fa-calendar-alt me-2"></i>
            <strong>Expiry Tracking:</strong> Monitoring product expiration dates with FIFO implementation.
            <button class="btn btn-sm btn-light ms-3" onclick="loadInventoryData()">Reset</button>
        </td>
    `;
    
    // Insert at the top of the table
    tableBody.insertBefore(infoRow, tableBody.firstChild);
    
    // Update table headers for expiry info
    const headerRow = document.querySelector('#inventoryTable thead tr');
    if (headerRow) {
        // Replace some columns with expiry information
        headerRow.deleteCell(11); // Actions
        headerRow.deleteCell(10); // Last Updated
        headerRow.deleteCell(9); // Reorder Level
        
        const batchHeader = document.createElement('th');
        batchHeader.textContent = 'Batch Info';
        headerRow.appendChild(batchHeader);
        
        const expiryHeader = document.createElement('th');
        expiryHeader.textContent = 'Expiry Status';
        headerRow.appendChild(expiryHeader);
        
        const actionHeader = document.createElement('th');
        actionHeader.textContent = 'Action';
        headerRow.appendChild(actionHeader);
    }
    
    // Add expiry data to each item
    items.forEach(item => {
        const row = document.querySelector(`tr[data-id="${item.id}"]`);
        if (!row) return;
        
        // Create simulated batch and expiry data
        // Generate multiple batches with different expiry dates
        const batches = [];
        let remainingQty = item.quantity;
        const today = new Date();
        
        // Generate 1-3 batches per product
        const batchCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < batchCount && remainingQty > 0; i++) {
            // Create random expiry date
            const expiryDate = new Date();
            
            // Different product categories have different shelf lives
            let daysToAdd;
            if (item.category === 'Dairy') {
                daysToAdd = Math.floor(Math.random() * 30) + 5; // 5-35 days
            } else if (item.category === 'Confectionery') {
                daysToAdd = Math.floor(Math.random() * 90) + 30; // 30-120 days
            } else {
                daysToAdd = Math.floor(Math.random() * 180) + 60; // 60-240 days
            }
            
            expiryDate.setDate(today.getDate() + daysToAdd);
            
            // Assign quantity to this batch
            const batchQty = i === batchCount - 1 ? 
                remainingQty : 
                Math.floor(Math.random() * remainingQty * 0.7) + 1;
            
            remainingQty -= batchQty;
            
            // Generate batch ID
            const batchId = `B${item.id}${i+1}-${expiryDate.getMonth()+1}${expiryDate.getFullYear().toString().substr(2)}`;
            
            batches.push({
                id: batchId,
                quantity: batchQty,
                expiryDate: expiryDate,
                daysLeft: Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24))
            });
        }
        
        // Sort batches by expiry date (FIFO)
        batches.sort((a, b) => a.daysLeft - b.daysLeft);
        
        // Replace cells with expiry information
        if (row.cells && row.cells.length >= 12) {
            row.deleteCell(11); // Actions
            row.deleteCell(10); // Last Updated
            row.deleteCell(9); // Reorder Level
            
            // Add batch info cell
            const batchCell = document.createElement('td');
            batchCell.innerHTML = `
                <div class="batch-info">
                    ${batches.map(batch => `
                        <div class="mb-1">
                            <small class="d-block"><strong>${batch.id}</strong> (${batch.quantity} units)</small>
                        </div>
                    `).join('')}
                </div>
            `;
            row.appendChild(batchCell);
            
            // Add expiry status cell
            const expiryCell = document.createElement('td');
            
            // Check for expired or near-expiry products
            const hasExpired = batches.some(b => b.daysLeft <= 0);
            const nearExpiry = batches.some(b => b.daysLeft > 0 && b.daysLeft <= 7);
            
            if (hasExpired) {
                expiryCell.innerHTML = `
                    <div class="alert alert-danger py-1 mb-1">
                        <i class="fas fa-exclamation-circle me-1"></i> Expired batch present
                    </div>
                    ${batches.map(batch => `
                        <div class="expiry-item ${batch.daysLeft <= 0 ? 'text-danger' : batch.daysLeft <= 7 ? 'text-warning' : ''}">
                            <small>${batch.daysLeft <= 0 ? 'Expired' : batch.daysLeft + ' days left'}</small>
                            <div class="progress mt-1" style="height: 4px;">
                                <div class="progress-bar ${
                                    batch.daysLeft <= 0 ? 'bg-danger' : 
                                    batch.daysLeft <= 7 ? 'bg-warning' : 
                                    batch.daysLeft <= 30 ? 'bg-info' : 'bg-success'
                                }" 
                                style="width: ${Math.min(100, Math.max(0, batch.daysLeft) * 3)}%"></div>
                            </div>
                        </div>
                    `).join('')}
                `;
            } else if (nearExpiry) {
                expiryCell.innerHTML = `
                    <div class="alert alert-warning py-1 mb-1">
                        <i class="fas fa-exclamation-triangle me-1"></i> Near expiry
                    </div>
                    ${batches.map(batch => `
                        <div class="expiry-item ${batch.daysLeft <= 7 ? 'text-warning' : ''}">
                            <small>${batch.daysLeft} days left</small>
                            <div class="progress mt-1" style="height: 4px;">
                                <div class="progress-bar ${
                                    batch.daysLeft <= 7 ? 'bg-warning' : 
                                    batch.daysLeft <= 30 ? 'bg-info' : 'bg-success'
                                }" 
                                style="width: ${Math.min(100, batch.daysLeft * 3)}%"></div>
                            </div>
                        </div>
                    `).join('')}
                `;
            } else {
                expiryCell.innerHTML = `
                    <div class="alert alert-success py-1 mb-1">
                        <i class="fas fa-check-circle me-1"></i> Good condition
                    </div>
                    ${batches.map(batch => `
                        <div class="expiry-item">
                            <small>${batch.daysLeft} days left</small>
                            <div class="progress mt-1" style="height: 4px;">
                                <div class="progress-bar ${
                                    batch.daysLeft <= 30 ? 'bg-info' : 'bg-success'
                                }" 
                                style="width: ${Math.min(100, batch.daysLeft)}%"></div>
                            </div>
                        </div>
                    `).join('')}
                `;
            }
            
            row.appendChild(expiryCell);
            
            // Add action cell
            const actionCell = document.createElement('td');
            if (hasExpired) {
                actionCell.innerHTML = `
                    <button class="btn btn-sm btn-danger mb-1" onclick="alert('Marked ${batches.filter(b => b.daysLeft <= 0).reduce((sum, b) => sum + b.quantity, 0)} units for disposal')">
                        <i class="fas fa-trash-alt me-1"></i> Dispose
                    </button>
                    <button class="btn btn-sm btn-outline-primary" onclick="alert('FIFO enforcement activated for ${item.name}')">
                        <i class="fas fa-sort-amount-down me-1"></i> FIFO
                    </button>
                `;
            } else if (nearExpiry) {
                actionCell.innerHTML = `
                    <button class="btn btn-sm btn-warning mb-1" onclick="alert('Marked ${batches.filter(b => b.daysLeft <= 7).reduce((sum, b) => sum + b.quantity, 0)} units for promotion')">
                        <i class="fas fa-tag me-1"></i> Discount
                    </button>
                    <button class="btn btn-sm btn-outline-primary" onclick="alert('FIFO enforcement activated for ${item.name}')">
                        <i class="fas fa-sort-amount-down me-1"></i> FIFO
                    </button>
                `;
            } else {
                actionCell.innerHTML = `
                    <button class="btn btn-sm btn-outline-primary" onclick="alert('FIFO enforcement activated for ${item.name}')">
                        <i class="fas fa-sort-amount-down me-1"></i> FIFO
                    </button>
                `;
            }
            
            row.appendChild(actionCell);
        }
    });
}

// Apply sales analytics simulation
function applySalesAnalytics(items) {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;
    
    // Create a simulation info row
    const infoRow = document.createElement('tr');
    infoRow.classList.add('simulation-info-row');
    infoRow.innerHTML = `
        <td colspan="12" class="p-3 bg-info text-white">
            <i class="fas fa-chart-bar me-2"></i>
            <strong>Sales Analytics:</strong> Detailed performance metrics with seasonal pattern analysis.
            <button class="btn btn-sm btn-light ms-3" onclick="loadInventoryData()">Reset</button>
        </td>
    `;
    
    // Insert at the top of the table
    tableBody.insertBefore(infoRow, tableBody.firstChild);
    
    // Update table headers for sales analytics
    const headerRow = document.querySelector('#inventoryTable thead tr');
    if (headerRow) {
        // Replace some columns with sales analytics info
        headerRow.deleteCell(11); // Actions
        headerRow.deleteCell(10); // Last Updated
        headerRow.deleteCell(9); // Reorder Level
        
        const salesTrendHeader = document.createElement('th');
        salesTrendHeader.textContent = 'Sales Trend';
        headerRow.appendChild(salesTrendHeader);
        
        const seasonalHeader = document.createElement('th');
        seasonalHeader.textContent = 'Seasonal Pattern';
        headerRow.appendChild(seasonalHeader);
        
        const actionHeader = document.createElement('th');
        actionHeader.textContent = 'Action';
        headerRow.appendChild(actionHeader);
    }
    
    // Add sales analytics data to each item
    items.forEach(item => {
        const row = document.querySelector(`tr[data-id="${item.id}"]`);
        if (!row) return;
        
        // Generate simulated sales data
        const salesChange = (Math.random() * 40 - 20).toFixed(1); // -20% to +20%
        const salesTrend = salesChange > 10 ? 'Strong Growth' : 
                           salesChange > 0 ? 'Moderate Growth' :
                           salesChange > -10 ? 'Slight Decline' : 'Sharp Decline';
        
        // Generate seasonal pattern based on product category
        let seasonalPattern, peakMonths;
        
        if (item.category === 'Confectionery') {
            seasonalPattern = 'Holiday-driven';
            peakMonths = 'Oct-Dec';
        } else if (item.category === 'Dairy') {
            seasonalPattern = 'Consistent';
            peakMonths = 'Year-round';
        } else if (item.category === 'Essentials') {
            seasonalPattern = 'Consistent';
            peakMonths = 'Year-round';
        } else {
            seasonalPattern = 'Seasonal';
            peakMonths = 'Jun-Aug';
        }
        
        // Replace cells with sales analytics
        if (row.cells && row.cells.length >= 12) {
            row.deleteCell(11); // Actions
            row.deleteCell(10); // Last Updated
            row.deleteCell(9); // Reorder Level
            
            // Add sales trend cell
            const trendCell = document.createElement('td');
            trendCell.innerHTML = `
                <div class="sales-trend">
                    <span class="trend-badge badge ${salesChange > 0 ? 'bg-success' : 'bg-danger'}">
                        ${salesChange > 0 ? '+' : ''}${salesChange}%
                    </span>
                    <div class="trend-label mt-1">${salesTrend}</div>
                    <div class="trend-chart mt-2">
                        ${generateMiniChart(salesChange)}
                    </div>
                </div>
            `;
            row.appendChild(trendCell);
            
            // Add seasonal pattern cell
            const seasonalCell = document.createElement('td');
            seasonalCell.innerHTML = `
                <div class="seasonal-pattern">
                    <div class="pattern-type mb-1">${seasonalPattern}</div>
                    <div class="peak-months mb-1">
                        <small class="text-muted">Peak: ${peakMonths}</small>
                    </div>
                    <div class="year-chart">
                        ${generateSeasonalChart(seasonalPattern)}
                    </div>
                </div>
            `;
            row.appendChild(seasonalCell);
            
            // Add action cell
            const actionCell = document.createElement('td');
            
            if (salesChange < -10) {
                actionCell.innerHTML = `
                    <button class="btn btn-sm btn-danger mb-1" onclick="alert('Markdown strategy created for ${item.name}')">
                        <i class="fas fa-arrow-down me-1"></i> Markdown
                    </button>
                    <button class="btn btn-sm btn-outline-secondary mt-1" onclick="alert('Detailed report generated for ${item.name}')">
                        <i class="fas fa-file-alt me-1"></i> Report
                    </button>
                `;
            } else if (salesChange > 10) {
                actionCell.innerHTML = `
                    <button class="btn btn-sm btn-success mb-1" onclick="alert('Stock increase plan created for ${item.name}')">
                        <i class="fas fa-arrow-up me-1"></i> Increase Stock
                    </button>
                    <button class="btn btn-sm btn-outline-secondary mt-1" onclick="alert('Detailed report generated for ${item.name}')">
                        <i class="fas fa-file-alt me-1"></i> Report
                    </button>
                `;
            } else {
                actionCell.innerHTML = `
                    <button class="btn btn-sm btn-info mb-1" onclick="alert('Stock optimization plan created for ${item.name}')">
                        <i class="fas fa-balance-scale me-1"></i> Optimize
                    </button>
                    <button class="btn btn-sm btn-outline-secondary mt-1" onclick="alert('Detailed report generated for ${item.name}')">
                        <i class="fas fa-file-alt me-1"></i> Report
                    </button>
                `;
            }
            
            row.appendChild(actionCell);
        }
    });
}

// Generate mini chart for sales trend
function generateMiniChart(salesChange) {
    // Simple mini bar chart with 6 bars
    const barCount = 6;
    let bars = '';
    
    for (let i = 0; i < barCount; i++) {
        // For the trend, make each bar in relation to the sales change
        // Last bar should be the current change
        const baseHeight = 30; // base height in pixels
        let height;
        
        if (i === barCount - 1) {
            // Current value (sales change)
            height = baseHeight + (salesChange * 1.5);
        } else {
            // Previous values (random but trending toward current)
            const factor = i / (barCount - 1); // 0 to 1
            const randomVariation = (Math.random() * 20) - 10; // -10 to +10
            height = baseHeight + (factor * salesChange * 1.5) + randomVariation;
        }
        
        // Ensure minimum height
        height = Math.max(5, height);
        
        const barClass = i === barCount - 1 ? 
            (salesChange > 0 ? 'trend-bar-current-up' : 'trend-bar-current-down') : 
            'trend-bar';
        
        bars += `<div class="${barClass}" style="height: ${height}px;"></div>`;
    }
    
    return `<div class="mini-chart">${bars}</div>`;
}

// Generate seasonal chart
function generateSeasonalChart(pattern) {
    // Simple yearly line chart showing 12 months
    const months = 12;
    let dots = '';
    
    const baseHeight = 15; // base height in pixels
    const maxVariation = 15; // maximum height variation
    
    for (let i = 0; i < months; i++) {
        let height;
        
        if (pattern === 'Holiday-driven') {
            // Higher in Oct-Dec (9-11)
            if (i >= 9) {
                height = baseHeight + maxVariation - (Math.random() * 5);
            } else {
                height = baseHeight + (Math.random() * 8) - 4;
            }
        } else if (pattern === 'Seasonal' && i >= 5 && i <= 7) {
            // Higher in Jun-Aug (5-7)
            height = baseHeight + maxVariation - (Math.random() * 5);
        } else if (pattern === 'Consistent') {
            // Consistent with small variations
            height = baseHeight + (Math.random() * 6) - 3;
        } else {
            // Other patterns - random variations
            height = baseHeight + (Math.random() * 10) - 5;
        }
        
        // Ensure minimum height
        height = Math.max(5, height);
        
        // Highlight peak months
        const isPeak = (pattern === 'Holiday-driven' && i >= 9) || 
                       (pattern === 'Seasonal' && i >= 5 && i <= 7);
        
        const dotClass = isPeak ? 'season-dot-peak' : 'season-dot';
        
        dots += `<div class="${dotClass}" style="bottom: ${height}px;"></div>`;
    }
    
    return `<div class="season-chart">${dots}</div>`;
}

// Apply inventory restructuring simulation
function applyInventoryRestructuring(items) {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;
    
    // Create a simulation info row
    const infoRow = document.createElement('tr');
    infoRow.classList.add('simulation-info-row');
    infoRow.innerHTML = `
        <td colspan="12" class="p-3 bg-secondary text-white">
            <i class="fas fa-layer-group me-2"></i>
            <strong>Inventory Restructuring:</strong> FIFO/LIFO implementation with product hierarchies.
            <button class="btn btn-sm btn-light ms-3" onclick="loadInventoryData()">Reset</button>
        </td>
    `;
    
    // Insert at the top of the table
    tableBody.insertBefore(infoRow, tableBody.firstChild);
    
    // Group items by category to create hierarchy
    const categories = {};
    items.forEach(item => {
        if (!categories[item.category]) {
            categories[item.category] = [];
        }
        categories[item.category].push(item);
    });
    
    // Clear the table body except for the info row
    const infoRows = tableBody.querySelectorAll('.simulation-info-row');
    tableBody.innerHTML = '';
    infoRows.forEach(row => tableBody.appendChild(row));
    
    // Update table headers
    const headerRow = document.querySelector('#inventoryTable thead tr');
    if (headerRow) {
        headerRow.innerHTML = `
            <th>Category/Product</th>
            <th>SKU</th>
            <th>Quantity</th>
            <th>Value</th>
            <th>Method</th>
            <th>Valuation</th>
            <th>Actions</th>
        `;
    }
    
    // Add category groups and products
    Object.keys(categories).sort().forEach(category => {
        // Add category row
        const categoryRow = document.createElement('tr');
        categoryRow.classList.add('category-row');
        
        const categoryItems = categories[category];
        const totalCategoryValue = categoryItems.reduce((sum, item) => 
            sum + (item.quantity * item.cost), 0);
        
        categoryRow.innerHTML = `
            <td colspan="7" class="category-header">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <i class="fas fa-folder me-2"></i>
                        <strong>${category}</strong>
                        <span class="badge bg-primary ms-2">${categoryItems.length} Products</span>
                    </div>
                    <div>
                        <span class="badge bg-success">₹${totalCategoryValue.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </td>
        `;
        
        tableBody.appendChild(categoryRow);
        
        // Add product rows for this category
        categoryItems.forEach(item => {
            // Determine valuation method (random for simulation)
            const methods = ['FIFO', 'LIFO', 'WAC']; // First-In-First-Out, Last-In-First-Out, Weighted Average Cost
            const method = methods[Math.floor(Math.random() * methods.length)];
            
            // Calculate inventory value
            const totalValue = item.quantity * item.cost;
            
            // Generate FIFO/LIFO value variation (simulation)
            let methodValue = totalValue;
            let valueDifference = 0;
            
            if (method === 'FIFO') {
                // FIFO typically results in lower COGS in inflationary environments
                methodValue = totalValue * (1 - (Math.random() * 0.05));
                valueDifference = totalValue - methodValue;
            } else if (method === 'LIFO') {
                // LIFO typically results in higher COGS in inflationary environments
                methodValue = totalValue * (1 + (Math.random() * 0.06));
                valueDifference = methodValue - totalValue;
            }
            
            // Create product row
            const productRow = document.createElement('tr');
            productRow.dataset.id = item.id;
            productRow.classList.add('product-row');
            
            productRow.innerHTML = `
                <td>
                    <div class="ps-4">
                        <i class="fas fa-box me-2"></i>
                        ${item.name}
                    </div>
                </td>
                <td>${item.sku}</td>
                <td>${item.quantity}</td>
                <td>₹${totalValue.toLocaleString('en-IN')}</td>
                <td>
                    <select class="form-select form-select-sm inventory-method">
                        ${methods.map(m => `<option value="${m}" ${m === method ? 'selected' : ''}>${m}</option>`).join('')}
                    </select>
                </td>
                <td>
                    <div>₹${methodValue.toLocaleString('en-IN')}</div>
                    <small class="${valueDifference >= 0 ? 'text-success' : 'text-danger'}">
                        ${valueDifference >= 0 ? '+' : ''}₹${Math.abs(valueDifference).toLocaleString('en-IN')}
                    </small>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="alert('Hierarchy editor opened for ${item.name}')">
                        <i class="fas fa-sitemap"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="alert('Taxonomy updated for ${item.name}')">
                        <i class="fas fa-tag"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(productRow);
        });
    });
    
    // Add listener for method change
    document.querySelectorAll('.inventory-method').forEach(select => {
        select.addEventListener('change', function() {
            const row = this.closest('tr');
            const valueCell = row.cells[5];
            const currentValue = parseFloat(valueCell.textContent.replace(/[₹,]/g, ''));
            
            // Simulate value change based on selected method
            let newValue, valueDifference;
            
            if (this.value === 'FIFO') {
                newValue = currentValue * (1 - (Math.random() * 0.05));
                valueDifference = currentValue - newValue;
            } else if (this.value === 'LIFO') {
                newValue = currentValue * (1 + (Math.random() * 0.06));
                valueDifference = newValue - currentValue;
            } else {
                // WAC - somewhere in between
                newValue = currentValue * (1 + (Math.random() * 0.02 - 0.01));
                valueDifference = newValue - currentValue;
            }
            
            valueCell.innerHTML = `
                <div>₹${newValue.toLocaleString('en-IN')}</div>
                <small class="${valueDifference >= 0 ? 'text-success' : 'text-danger'}">
                    ${valueDifference >= 0 ? '+' : ''}₹${Math.abs(valueDifference).toLocaleString('en-IN')}
                </small>
            `;
            
            // Show notification of the change
            showSuccessNotification(`Valuation method updated to ${this.value}`);
        });
    });
}

// Show processing notification
function showProcessingNotification(message = 'Processing...') {
    const notification = document.createElement('div');
    notification.classList.add('processing-notification');
    notification.innerHTML = `
        <div class="spinner-border spinner-border-sm text-light me-2"></div>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Show success notification
function showSuccessNotification(message = 'Success') {
    const notification = document.createElement('div');
    notification.classList.add('success-notification');
    notification.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Show error notification
function showErrorNotification(message = 'Error occurred') {
    const notification = document.createElement('div');
    notification.classList.add('error-notification');
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle me-2"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Item edit functionality
function editItem(id) {
    alert(`Edit functionality for item ID: ${id}`);
}

// Item order functionality
function orderItem(id) {
    alert(`Order functionality for item ID: ${id}`);
}

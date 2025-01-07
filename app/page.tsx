"use client";
import { useState } from "react";
import { jsPDF } from "jspdf";
import styles from "./page.module.css"; // Import styles as a module

interface Product {
  name: string;
  unitType: string;
  unitPrice: string;
  quantityPerCup: string;
  totalPieces?: string;
}

export default function Calc() {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState<Product>({
    name: "",
    unitType: "",
    unitPrice: "",
    quantityPerCup: "",
    totalPieces: "",
  });
  const [sellingPrice, setSellingPrice] = useState("");
  const [additionalCost, setAdditionalCost] = useState("");
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false); // Toggle state for the material form

  const handleAddProduct = () => {
    setProducts([...products, { ...newProduct }]);
    setNewProduct({
      name: "",
      unitType: "",
      unitPrice: "",
      quantityPerCup: "",
      totalPieces: "",
    });
  };

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  const calculateCostPerCup = () => {
    return products.reduce((total, product) => {
      let costPerUnit;
      if (product.unitType === "box") {
        const totalPieces = parseFloat(product.totalPieces || "1");
        costPerUnit = parseFloat(product.unitPrice) / totalPieces;
      } else {
        const unitConversion =
          product.unitType === "kg" || product.unitType === "liter" ? 1000 : 1;
        costPerUnit = parseFloat(product.unitPrice) / unitConversion;
      }
      const costForProduct = parseFloat(product.quantityPerCup) * costPerUnit;
      return total + costForProduct;
    }, parseFloat(additionalCost));
  };

  const calculateProfitPerCup = () => {
    const costPerCup = calculateCostPerCup();
    return parseFloat(sellingPrice) - costPerCup;
  };

  const calculateProfitPercentage = () => {
    const costPerCup = calculateCostPerCup();
    const profit = calculateProfitPerCup();
    return (profit / costPerCup) * 100;
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Table for Results (Left side)
    const costPerCup = calculateCostPerCup().toFixed(2);
    const profitPerCup = calculateProfitPerCup().toFixed(2);
    const profitPercentage = calculateProfitPercentage().toFixed(2);

    doc.text("Cost per Cup: ₹" + costPerCup, 10, 10);
    doc.text("Profit per Cup: ₹" + profitPerCup, 10, 20);
    doc.text("Profit Percentage: " + profitPercentage + "%", 10, 30);

    // Table for Products (Right side)
    let yOffset = 40;
    doc.text("Material List", 120, yOffset); // Title for the right side

    // Loop through products and add each one to the PDF
    yOffset += 10;
    products.forEach((product, i) => {
      doc.text(`Name: ${product.name}`, 120, yOffset);
      doc.text(`Unit Type: ${product.unitType}`, 120, yOffset + 10);
      doc.text(
        `Price per ${product.unitType}: ₹${product.unitPrice}`,
        120,
        yOffset + 20
      );
      if (product.unitType === "box") {
        doc.text(`Total Pieces: ${product.totalPieces}`, 120, yOffset + 30);
      }
      doc.text(
        `Quantity per Cup: ${product.quantityPerCup}`,
        120,
        yOffset + 40
      );
      yOffset += 50; // Adjust spacing between products
    });

    // Save the PDF
    doc.save("material_and_profit_report.pdf");
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <h1>Material Cost and Profit Calculator</h1>
        <div>
          <h2
            onClick={() => setIsAddMaterialOpen(!isAddMaterialOpen)}
            className={styles.toggleButton}
          >
            {isAddMaterialOpen ? "Hide" : "Add a Material"}
          </h2>
          {isAddMaterialOpen && (
            <div className={styles.addMaterialForm}>
              <label>
                Material Name:
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                />
              </label>
              <br />
              <label>
                Unit Type:
                <select
                  value={newProduct.unitType}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, unitType: e.target.value })
                  }
                >
                  <option value="">Select Unit</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="liter">Liter (L)</option>
                  <option value="box">Box (pieces)</option>
                </select>
              </label>
              <br />
              <label>
                Price per {newProduct.unitType || "unit"} (₹):
                <input
                  type="number"
                  value={newProduct.unitPrice}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, unitPrice: e.target.value })
                  }
                />
              </label>
              <br />
              {newProduct.unitType === "box" && (
                <>
                  <label>
                    Total Pieces in Box:
                    <input
                      type="number"
                      value={newProduct.totalPieces}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          totalPieces: e.target.value,
                        })
                      }
                    />
                  </label>
                  <br />
                </>
              )}
              <label>
                Quantity Per Cup (g/ml/piece):
                <input
                  type="number"
                  value={newProduct.quantityPerCup}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, quantityPerCup: e.target.value })
                  }
                />
              </label>
              <br />
              <button type="button" onClick={handleAddProduct}>
                Add Material
              </button>
            </div>
          )}
        </div>
        <br />
        <div>
          <label>
            Selling Price Per Cup (₹):
            <input
              type="number"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
            />
          </label>
          <br />
          <label>
            Additional Costs (Labour, Glass, Straw, Electricity) (₹):
            <input
              type="number"
              value={additionalCost}
              onChange={(e) => setAdditionalCost(e.target.value)}
            />
          </label>
          <br />
        </div>
        {products.length > 0 && sellingPrice && additionalCost && (
          <>
            <h2>Results</h2>
            <p className={styles.resultText}>
              Cost Per Cup: ₹{calculateCostPerCup().toFixed(2)}
            </p>
            <p className={styles.resultText}>
              Profit Per Cup: ₹{calculateProfitPerCup().toFixed(2)}
            </p>
            <p className={styles.resultText}>
              Profit Percentage: {calculateProfitPercentage().toFixed(2)}%
            </p>
            <button onClick={generatePDF}>Generate PDF</button>
          </>
        )}
      </div>
      <div className={styles.rightPanel}>
        <h2>Added Materials</h2>
        <ul className={styles.productList}>
          {products.map((product, i) => (
            <li key={i} className={styles.productListItem}>
              <div className={styles.productListItemText}>
                <strong>Name:</strong> {product.name} <br />
                <strong>Unit Type:</strong> {product.unitType} <br />
                <strong>Price per {product.unitType}:</strong> ₹
                {product.unitPrice} <br />
                {product.unitType === "box" && (
                  <>
                    <strong>Total Pieces:</strong> {product.totalPieces} <br />
                  </>
                )}
                <strong>Quantity per Cup:</strong> {product.quantityPerCup}{" "}
                <br />
              </div>
              <button onClick={() => handleRemoveProduct(i)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

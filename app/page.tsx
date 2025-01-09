/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";
import { useState } from "react";
import { jsPDF } from "jspdf";
import styles from "./page.module.css";

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
    const profit = calculateProfitPerCup();
    return (profit / parseFloat(sellingPrice)) * 100;
  };

  const calculateCostPercentage = () => {
    const costPerCup = calculateCostPerCup();
    return (costPerCup / parseFloat(sellingPrice)) * 100;
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Table for Results (Left side)
    const costPerCup = calculateCostPerCup().toFixed(2);
    const profitPerCup = calculateProfitPerCup().toFixed(2);
    const profitPercentage = calculateProfitPercentage().toFixed(2);
    const costPercentage = calculateCostPercentage().toFixed(2);

    doc.text("Cost per Cup: ₹" + costPerCup, 10, 10);
    doc.text("Cost Percentage: " + costPercentage + "%", 10, 20);
    doc.text("Profit per Cup: ₹" + profitPerCup, 10, 30);
    doc.text("Profit Percentage: " + profitPercentage + "%", 10, 40);

    let yOffset = 50;
    doc.text("Material List", 120, yOffset);

    yOffset += 10;
    products.forEach((product, index) => {
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
      yOffset += 50;
    });

    doc.save("material_and_profit_report.pdf");
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <h1>Material Cost and Profit Calculator</h1>
        <div>
          <h2>Add a Material</h2>
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
              Cost Percentage: {calculateCostPercentage().toFixed(2)}%
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
          {products.map((product, index) => (
            <li key={index} className={styles.productListItem}>
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
              <button onClick={() => handleRemoveProduct(index)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

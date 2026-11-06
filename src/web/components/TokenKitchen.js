import React, { useMemo, useState } from 'react';

const RECIPES = [
    { ingredient: 'Tomato', style: 'vegetarian', dish: 'Soup', recipe: 'Tomato soup', minutes: 25, servings: 4 },
    { ingredient: 'Tomato', style: 'vegetarian', dish: 'Salad', recipe: 'Tomato salad', minutes: 10, servings: 2 },
    { ingredient: 'Lentil', style: 'vegetarian', dish: 'Soup', recipe: 'Lentil soup', minutes: 45, servings: 6 },
    { ingredient: 'Lentil', style: 'vegetarian', dish: 'Stew', recipe: 'Lentil stew', minutes: 50, servings: 6 },
    { ingredient: 'Oat', style: 'vegetarian', dish: 'Porridge', recipe: 'Oat porridge', minutes: 15, servings: 2 },
    { ingredient: 'Apple', style: 'vegetarian', dish: 'Cake', recipe: 'Apple cake', minutes: 75, servings: 8 },
    { ingredient: 'Apple', style: 'vegetarian', dish: 'Cake', recipe: 'Apple strudel', minutes: 90, servings: 6 },
    { ingredient: 'Chicken', style: 'Meat', dish: 'Soup', recipe: 'Chicken soup', minutes: 60, servings: 4 },
    { ingredient: 'Chicken', style: 'Meat', dish: 'Porridge', recipe: 'Chicken congee', minutes: 50, servings: 4 },
    { ingredient: 'Lamb', style: 'Meat', dish: 'Stew', recipe: 'Lamb stew', minutes: 90, servings: 6 },
];

export default function TokenKitchen() {
    const [style, setStyle] = useState('vegetarian');
    const ingredients = useMemo(
        () => [...new Set(RECIPES.filter((row) => row.style === style).map((row) => row.ingredient))],
        [style]
    );
    const [ingredient, setIngredient] = useState('Tomato');
    const [guests, setGuests] = useState(4);
    const [chosen, setChosen] = useState(null);

    const selectStyle = (nextStyle) => {
        setStyle(nextStyle);
        setIngredient([...new Set(RECIPES.filter((row) => row.style === nextStyle).map((row) => row.ingredient))][0]);
        setChosen(null);
    };

    const hits = RECIPES.filter((row) => row.ingredient === ingredient);
    const pantryIngredients = new Set(RECIPES.map((row) => row.ingredient));
    const pantryVegetarian = new Set(RECIPES.filter((row) => row.style === 'vegetarian').map((row) => row.ingredient));
    const factor = chosen ? (Number(guests) / chosen.servings) : 0;
    const totalMinutes = chosen ? Math.round(chosen.minutes + (factor - 1) * 8) : 0;
    const cakeRows = chosen?.dish === 'Cake'
        ? [['Flour', 60], ['Sugar', 30], ['Butter', 40], ['Apple', 70]]
        : [];

    return (
        <section className="s4c-token-kitchen" aria-label="Interactive token kitchen">
            <div className="s4c-token-kitchen__inputs">
                <label>
                    <span>Style <code>$style$</code></span>
                    <select value={style} onChange={(event) => selectStyle(event.target.value)}>
                        <option value="vegetarian">vegetarian</option>
                        <option value="Meat">Meat</option>
                    </select>
                </label>
                <label>
                    <span>Main ingredient <code>$ingredient$</code></span>
                    <select value={ingredient} onChange={(event) => { setIngredient(event.target.value); setChosen(null); }}>
                        {ingredients.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                </label>
                <label>
                    <span>Guests <code>$guests$</code></span>
                    <input type="number" min="1" max="20" value={guests} onChange={(event) => setGuests(Math.max(1, Math.min(20, Number(event.target.value) || 1)))} />
                </label>
            </div>

            <div className="s4c-token-kitchen__tokens">
                <strong>Dashboard</strong> style: <code>{style}</code> · ingredient: <code>{ingredient}</code> · guests: <code>{guests}</code>
                <br />
                <strong>Search</strong> pantry: <code>{pantryIngredients.size} ingredients</code>, <code>{pantryVegetarian.size} vegetarian</code>
                <br />
                <strong>Environment</strong> <code>$env:user$</code> and <code>$env:locale$</code> are supplied by Splunk.
            </div>

            <div className="s4c-token-kitchen__grid">
                <div>
                    <h3>Recipes with {ingredient}</h3>
                    <p className="s4c-token-kitchen__hint">Click a row to set <code>$dish$</code>, <code>$recipe$</code>, <code>$minutes$</code>, and <code>$servings$</code>.</p>
                    <table>
                        <thead><tr><th>Dish</th><th>Recipe</th><th>Minutes</th><th>Serves</th></tr></thead>
                        <tbody>
                            {hits.map((row) => (
                                <tr key={row.recipe}>
                                    <td>{row.dish}</td><td><button type="button" onClick={() => setChosen(row)}>{row.recipe}</button></td><td>{row.minutes}</td><td>{row.servings}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="s4c-token-kitchen__recipe-card" aria-live="polite">
                    {chosen ? (
                        <>
                            <p className="s4c-token-kitchen__eyebrow">Condition true: <code>$recipe$ != ""</code></p>
                            <h3>Today: {chosen.recipe} for {guests} guests</h3>
                            <p>{chosen.minutes} minutes · serves {chosen.servings} · {chosen.dish}</p>
                            <p>Search token <code>$scale:result.factor$</code>: <strong>{factor.toFixed(1)}</strong></p>
                            <p>Search token <code>$scale:result.total$</code>: about <strong>{totalMinutes} minutes</strong></p>
                            <p>Eval token <code>$eval:shop$</code>: Buy {Number(guests) * 150} g of the main ingredient.</p>
                        </>
                    ) : (
                        <p>Select a recipe. This panel represents a conditional visualization: it appears only when <code>$recipe$</code> has a value.</p>
                    )}
                </div>
            </div>

            {cakeRows.length > 0 && (
                <div className="s4c-token-kitchen__cake">
                    <h3>Ingredients for {chosen.recipe}</h3>
                    <p><code>hideWhenNoData</code> is false only for a cake.</p>
                    <ul>{cakeRows.map(([item, grams]) => <li key={item}>{item}: {Math.round(grams * Number(guests))} g</li>)}</ul>
                </div>
            )}
        </section>
    );
}

(function() {
  console.log("FDM: скрипт загружен");
  
  setInterval(() => {
    // Ищем блок, где находится кнопка "Создать техпроцесс"
    const genBtn = document.querySelector('[data-ia="gen"]');
    
    if (genBtn && !document.getElementById("btnFDM")) {
      console.log("FDM: создаю кнопку");
      
      const fdmBtn = document.createElement("button");
      fdmBtn.id = "btnFDM";
      fdmBtn.className = "btn";
      fdmBtn.textContent = "Создать FDM-техпроцесс";
      fdmBtn.style.backgroundColor = "#1f5fa8"; 
      fdmBtn.style.color = "#fff";
      fdmBtn.style.marginLeft = "10px";

      // Вставляем кнопку в тот же контейнер, где лежит обычная кнопка, прямо после неё
      genBtn.parentNode.insertBefore(fdmBtn, genBtn.nextSibling);

      // Клик по кнопке
      fdmBtn.onclick = function(e) {
        e.preventDefault();
        
        if (typeof IMP === "undefined" || !IMP) {
          alert("Сначала загрузите модель (нажмите 'Пример: вал' или 'Пример: плита')!");
          return;
        }

        try {
          const M = {ro: 1.24, tn: 215, tb: 60};
          const V = IMP.vol ? IMP.vol / 1000 : 10;
          const mf = V * M.ro * (0.35 + 0.65 * 0.2);
          
          const c = blankCard();
          Object.assign(c.h, {
            oboz: IMPO.oboz || "FDM-001", 
            name: IMPO.name || "Деталь FDM", 
            mat: "PLA ГОСТ Р 58576-2019", 
            ev: "г",
            md: mf.toFixed(1), 
            mz: (mf * 1.05).toFixed(1), 
            date: new Date().toLocaleDateString("ru-RU")
          });
          
          const T = (text, tools) => Object.assign(blankTr(), { text, tools: tools || "" });
          const add = op => { const x = Object.assign(blankOp(), op); c.ops.push(x); return x; };
          
          add({vid:"Аддитивная (FDM)",name:"Подготовка модели",eq:"PrusaSlicer",r:"3",tpz:"10",tsht:"15",tr:[T("Импорт STL","—")]});
          add({vid:"Аддитивная (FDM)",name:"3D-печать FDM",eq:"Prusa i3 MK3S+",r:"3",tpz:"20",tsht:"120",fdmLayer:"0,2",fdmNozzle:"0,4",fdmInfill:"20",fdmTN:"215",fdmTB:"60",tr:[T("Печать G-code","—")]});
          add({vid:"Слесарная",name:"Постобработка",eq:"Верстак",r:"2",tpz:"3",tsht:"10",tr:[T("Удалить поддержки","Кусачки")]});
          add({vid:"Контроль",name:"Контрольная",eq:"ОТК",r:"4",tpz:"",tsht:"5",tr:[T("Проверить размеры","—")]});
          
          c.ops.forEach((op, i) => op.num = String(i * 5 + 5).padStart(3, "0"));
          
          S.cards.push(c);
          S.cur = c.id;
          S.tab = "ops";
          save();
          renderAll();
          
          alert("✅ FDM-техпроцесс создан! Откройте вкладку 'Операции'.");
        } catch (err) {
          alert("Ошибка: " + err.message);
        }
      };
    }
  }, 500); // Проверяем каждые 0.5 секунды
})();

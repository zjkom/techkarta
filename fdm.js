(function() {
  const timer = setInterval(() => {
    if (typeof window.genProcess === "function" && document.getElementById("editor")) {
      clearInterval(timer);
      
      const FDM_MAT = {
        "PLA ГОСТ Р 58576-2019": { ro: 1.24, tn: 215, tb: 60 },
        "PETG": { ro: 1.27, tn: 240, tb: 80 },
        "ABS": { ro: 1.04, tn: 250, tb: 100 },
        "TPU": { ro: 1.21, tn: 230, tb: 50 },
        "Нейлон": { ro: 1.14, tn: 265, tb: 90 }
      };

      // Добавляем кнопку через 1 секунду после загрузки страницы
      setInterval(() => {
        const importPanel = document.querySelector('[data-ia="gen"]');
        if (importPanel && !document.querySelector('[data-ia="genFDM"]')) {
          const fdmBtn = document.createElement("button");
          fdmBtn.className = "btn";
          fdmBtn.dataset.ia = "genFDM";
          fdmBtn.textContent = "Создать FDM-техпроцесс";
          
          fdmBtn.onclick = function(e) {
            e.preventDefault();
            // Проверяем, загружена ли модель
            if (typeof IMP === "undefined" || !IMP) {
              alert("Сначала загрузите 3D-модель или нажмите 'Пример: вал'");
              return;
            }
            
            try {
              const A = IMP;
              const o = { fdmMat: "PLA ГОСТ Р 58576-2019", fdmLayer: "0,2", fdmNozzle: "0,4", fdmInfill: "20", fdmEq: "Prusa i3 MK3S+" };
              const M = FDM_MAT[o.fdmMat];
              const V = A.vol ? A.vol / 1000 : 10;
              const mf = V * M.ro * (0.35 + 0.65 * 0.2);
              
              // Создаем новую карту через встроенную функцию
              const c = blankCard();
              Object.assign(c.h, {
                oboz: "FDM-001", name: "Деталь FDM", mat: o.fdmMat, ev: "г",
                md: mf.toFixed(1), mz: (mf * 1.05).toFixed(1), zagProf: "Филамент " + o.fdmMat, date: new Date().toLocaleDateString("ru-RU")
              });
              
              const T = (text, tools) => Object.assign(blankTr(), { text, tools: tools || "" });
              const add = op => { const x = Object.assign(blankOp(), op); c.ops.push(x); return x; };
              
              add({vid:"Аддитивная (FDM)",name:"Подготовка модели",eq:"PrusaSlicer",r:"3",tpz:"10",tsht:"15",tr:[T("Импорт STL","—")]});
              add({vid:"Аддитивная (FDM)",name:"3D-печать FDM",eq:o.fdmEq,r:"3",tpz:"20",tsht:"120",fdmLayer:"0,2",fdmNozzle:"0,4",fdmInfill:"20",fdmTN:String(M.tn),fdmTB:String(M.tb),tr:[T("Печать G-code","—")]});
              add({vid:"Слесарная",name:"Постобработка",eq:"Верстак",r:"2",tpz:"3",tsht:"10",tr:[T("Удалить поддержки","Кусачки")]});
              add({vid:"Контроль",name:"Контрольная",eq:"ОТК",r:"4",tpz:"",tsht:"5",tr:[T("Проверить размеры","—")]});
              
              c.ops.forEach((op, i) => op.num = String(i * 5 + 5).padStart(3, "0"));
              
              // Сохраняем и перерисовываем
              S.cards.push(c);
              S.cur = c.id;
              S.tab = "ops";
              save();
              renderAll();
            } catch (err) {
              alert("Ошибка: " + err.message);
            }
          };
          importPanel.parentNode.appendChild(fdmBtn);
        }
      }, 1000);
    }
  }, 500);
})();

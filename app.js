const dialog = document.querySelector('#info');
const content = document.querySelector('#dialog-content');
const panels = {
 machine: `<span class="label">01 / Устройство станка</span><h2>Три направления.<br>Ещё одна степень свободы.</h2><p>Оси X, Y и Z задают положение инструмента относительно заготовки. Поворотная ось A вращает заготовку вокруг оси X и позволяет подводить к инструменту разные её стороны.</p><p>На первом экране показана условная кинематическая схема. Рабочее поле, мощность шпинделя и допустимые материалы определяются конкретной моделью.</p>`,
 technology: `<span class="label">02 / Технология</span><h2>Повернуть заготовку.<br>Продолжить обработку.</h2><p>Четвёртая ось может позиционировать заготовку перед следующим проходом или вращать её во время резания. Доступный режим зависит от механики, системы ЧПУ и управляющей программы.</p><p>Для подбора решения нужны чертёж, материал, габариты детали и требования к обработке. По ним можно определить подходящую конфигурацию.</p>`,
 approach: `<span class="label">03 / Подбор решения</span><h2>Начнём с вашей детали.</h2><ol><li>Опишите материал и размеры заготовки.</li><li>Укажите требуемые допуски и качество поверхности.</li><li>Добавьте объём выпуска и примеры деталей.</li><li>Уточните необходимость непрерывной четырёхосевой обработки.</li></ol><p>Эти данные станут основой для технического задания на станок.</p>`,
 brief: `<span class="label">Подбор станка</span><h2>Какая деталь<br>стоит за вашей задачей?</h2><p>Подготовьте краткое описание для обсуждения с поставщиком.</p><label for="brief-text">Материал, размеры, объём и требования</label><textarea id="brief-text" placeholder="Например: алюминий, заготовка 200 × 80 × 60 мм, мелкая серия. Нужна обработка с нескольких сторон."></textarea><button class="primary" id="download">Скачать описание <span>↓</span></button><p class="status" id="status" aria-live="polite">Описание сохранится в файл. Данные никуда не отправляются.</p>`
};
document.querySelectorAll('[data-info]').forEach(button => button.addEventListener('click', () => {
 content.innerHTML = panels[button.dataset.info]; dialog.showModal();
 const download = document.querySelector('#download');
 if(download) download.addEventListener('click', () => {
  const value = document.querySelector('#brief-text').value.trim();
  if(!value){ document.querySelector('#status').textContent='Добавьте описание вашей задачи.'; document.querySelector('#brief-text').focus(); return; }
  const url=URL.createObjectURL(new Blob(['Задача для подбора четырёхосевого станка\n\n'+value],{type:'text/plain;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='Задача-на-подбор-станка.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.querySelector('#status').textContent='Описание сохранено. Его можно передать поставщику.';
 });
}));
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-mode]').forEach(b=>{const selected=b===button;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
 const rotary=button.dataset.mode==='rotary';document.querySelector('.machine').classList.toggle('rotary-only',rotary);document.querySelector('#axis-description').textContent=rotary?'A / поворот заготовки вокруг оси X':'X · Y · Z + поворотная ось A';
}));

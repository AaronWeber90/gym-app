var e=async()=>(navigator.storage.persist&&await navigator.storage.persist(),navigator.storage.getDirectory()),t=async(e,t,n=!1)=>e.getDirectoryHandle(t,{create:n}),n=async(e,t,n=!1)=>e.getFileHandle(t,{create:n}),r=async(e,t)=>{if(typeof e.createWritable==`function`)try{let n=await e.createWritable();await n.write(t),await n.close();return}catch{}await i(e,t)},i=(e,t)=>new Promise((n,r)=>{let i=new Blob([`
			self.onmessage = async (e) => {
				try {
					const { handle, content } = e.data;
					const accessHandle = await handle.createSyncAccessHandle();
					const encoder = new TextEncoder();
					const encoded = encoder.encode(content);
					accessHandle.truncate(0);
					accessHandle.write(encoded);
					accessHandle.flush();
					accessHandle.close();
					self.postMessage({ ok: true });
				} catch (err) {
					self.postMessage({ ok: false, error: err.message });
				}
			};
		`],{type:`application/javascript`}),a=URL.createObjectURL(i),o=new Worker(a);o.onmessage=e=>{o.terminate(),URL.revokeObjectURL(a),e.data.ok?n():r(Error(e.data.error))},o.onerror=e=>{o.terminate(),URL.revokeObjectURL(a),r(Error(e.message))},o.postMessage({handle:e,content:t})});export{r as i,n,e as r,t};
var e=async()=>(navigator.storage.persist&&await navigator.storage.persist(),navigator.storage.getDirectory()),t=async(e,t,n=!1)=>e.getDirectoryHandle(t,{create:n}),n=async(e,t)=>{let n=await navigator.storage.getDirectory();for(let t=0;t<e.length-1;t++)n=await n.getDirectoryHandle(e[t],{create:!0});let i=e.at(-1);if(!i)throw Error(`writeFile: empty path`);let a=await n.getFileHandle(i,{create:!0});if(typeof a.createWritable==`function`)try{let e=await a.createWritable();return await e.write(t),await e.close(),`createWritable`}catch{}return await r(e,t),`worker`},r=(e,t)=>new Promise((n,r)=>{let i=new Blob([`
			self.onmessage = async (e) => {
				try {
					const { path, content } = e.data;
					const root = await navigator.storage.getDirectory();
					let dir = root;
					for (let i = 0; i < path.length - 1; i++) {
						dir = await dir.getDirectoryHandle(path[i], { create: true });
					}
					const handle = await dir.getFileHandle(path[path.length - 1], { create: true });
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
		`],{type:`application/javascript`}),a=URL.createObjectURL(i),o=new Worker(a);o.onmessage=e=>{o.terminate(),URL.revokeObjectURL(a),e.data.ok?n():r(Error(e.data.error))},o.onerror=e=>{o.terminate(),URL.revokeObjectURL(a),r(Error(e.message))},o.postMessage({path:e,content:t})});export{e as n,n as r,t};
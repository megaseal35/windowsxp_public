

export default function Farm() {
    return <div style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
    }}>
        <img style={{
            display: 'block',
            width: '100%',
        }} src='/desktop/farm_1.webp'/>
        <img style={{
            display: 'block',
            width: '100%',
        }} src='/desktop/farm_2.webp' />
    </div>
}
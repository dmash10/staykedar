import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 30,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#3b82f6',
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3b82f6',
    },
    title: {
        fontSize: 24,
        marginBottom: 10,
        color: '#1e293b',
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 20,
    },
    section: {
        marginBottom: 20,
        padding: 10,
    },
    sectionTitle: {
        fontSize: 18,
        color: '#1e3a8a',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 5,
        fontWeight: 'bold',
    },
    text: {
        fontSize: 12,
        marginBottom: 5,
        color: '#334155',
        lineHeight: 1.5,
    },
    rateTable: {
        display: 'flex',
        flexDirection: 'column',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 4,
        marginTop: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        padding: 8,
        alignItems: 'center',
    },
    tableHeader: {
        backgroundColor: '#f1f5f9',
        fontWeight: 'bold',
    },
    cellLabel: {
        width: '60%',
        fontSize: 12,
        color: '#475569',
    },
    cellValue: {
        width: '40%',
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1e293b',
        textAlign: 'right',
    },
    emergencyBox: {
        backgroundColor: '#fef2f2',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#fca5a5',
    },
    emergencyTitle: {
        fontSize: 14,
        color: '#991b1b',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    bold: {
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: 10,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 10,
    },
});

interface CityData {
    name: string;
    description: string;
    history?: string;
    how_to_reach?: string;
    taxi_rates: {
        drop_sonprayag_sedan: number;
        drop_sonprayag_suv: number;
        drop_sonprayag_tempo: number;
        per_km_rate_hills: number;
        driver_allowance: number;
    };
}

interface CityGuidePDFProps {
    city: CityData;
}

const CityGuidePDF: React.FC<CityGuidePDFProps> = ({ city }) => (
    <Document>
        <Page size="A4" style={styles.page}>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.logo}>StayKedarnath</Text>
                <Text style={{ fontSize: 10, color: '#64748b' }}>Offline Guide</Text>
            </View>

            {/* Main Title */}
            <View style={styles.section}>
                <Text style={styles.title}>{city.name} Travel Guide</Text>
                <Text style={styles.subtitle}>Essential information for your Kedarnath Yatra</Text>
                <Text style={styles.text}>{city.description}</Text>
            </View>

            {/* Taxi Rates */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Taxi Rates to Sonprayag</Text>
                <Text style={styles.text}>Fixed rates for one-way drop (Season 2025):</Text>

                <View style={styles.rateTable}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={styles.cellLabel}>Vehicle Type</Text>
                        <Text style={styles.cellValue}>Price</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.cellLabel}>Sedan (4 Seater)</Text>
                        <Text style={styles.cellValue}>Rs. {city.taxi_rates.drop_sonprayag_sedan?.toLocaleString()}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.cellLabel}>SUV (6-7 Seater)</Text>
                        <Text style={styles.cellValue}>Rs. {city.taxi_rates.drop_sonprayag_suv?.toLocaleString()}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.cellLabel}>Tempo Traveller (12 Seater)</Text>
                        <Text style={styles.cellValue}>Rs. {city.taxi_rates.drop_sonprayag_tempo?.toLocaleString()}</Text>
                    </View>
                </View>
                <Text style={[styles.text, { fontSize: 10, marginTop: 5, color: '#64748b' }]}>
                    * Driver Allowance: Rs. {city.taxi_rates.driver_allowance}/night. Hill rates apply for extra usage.
                </Text>
            </View>

            {/* Emergency Numbers */}
            <View style={[styles.section, styles.emergencyBox]}>
                <Text style={styles.emergencyTitle}>⚠️ Emergency Contacts</Text>
                <Text style={styles.text}>• Police Control Room: 100 / 112</Text>
                <Text style={styles.text}>• Ambulance: 108</Text>
                <Text style={styles.text}>• Women Helpline: 1090</Text>
                <Text style={styles.text}>• Tourist Helpline: 1364</Text>
                <Text style={styles.text}>• StayKedarnath Support: +91 90274 75942</Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text>Downloaded from https://staykedarnath.in - Your Trusted Yatra Partner</Text>
                <Text>Save this PDF for offline access in poor network areas.</Text>
            </View>
        </Page>
    </Document>
);

export default CityGuidePDF;
